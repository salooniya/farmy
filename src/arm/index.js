/* ==== src/arm ==== Advance Route Manager ==== */

const formatPathCache = {};
const formatPath = function (path, {start = true, end = false, str = '/'} = {}) {

    let originalPath = path;
    path = formatPathCache[`${path}-${start}-${end}-${str}`];

    if (path === undefined) {

        path = originalPath;

        if (path === str || path === '') path = str + str;

        if (start && !path.startsWith(str)) path = str + path;
        else if (!start && path.startsWith(str)) path = path.slice(str.length);

        if (end && !path.endsWith(str)) path = path + str;
        else if (!end && path.endsWith(str)) path = path.slice(0, -str.length);

        formatPathCache[`${path}-${start}-${end}-${str}`] = path;

    }

    return path;

};

const formatURL = function (url, {end = false} = {}) {
    return formatPath(url, {start: false, end});
};

const joinPathCache = {};
const joinPath = function (basePath, path, {str = '/'} = {}) {

    let joinedPath = joinPathCache[`${basePath}-${path}-${str}`];

    if (joinedPath === undefined) {

        if (basePath === str && path === str) joinedPath =  str;
        else if (basePath === str) joinedPath = path;
        else if (path === str) joinedPath = basePath
        else joinedPath = basePath + path;

        joinPathCache[`${basePath}-${path}-${str}`] = joinedPath;

    }

    return joinedPath;

};

const pathToRegexCache = {};
const pathToRegex = function (path) {

    let regex = pathToRegexCache[path];

    if (regex === undefined) {

        regex = new RegExp('^' + path.replace(/\//g, '\\/').replace(/:[-\w]+/g, '(\[-\\w]+)').replace(/\~/g, '(.+)') + '$');

        pathToRegexCache[path] = regex;

    }

    return regex;

};

const matchRegexCache = {};
const matchRegex = function (path, regex) {

    let match = matchRegexCache[`${path}-${regex}`];

    if (match === undefined) {

        match = path.match(regex);

        matchRegexCache[`${path}-${regex}`] = match;

    }

    return match;

};

const getRouteParamsCache = {};
const getRouteParams = function (route) {

    let params = getRouteParamsCache[`${route.path}-${route.match.input}`];

    if (params === undefined) {

        const values = route.match.slice(1);
        const keys = Array.from(route.path.matchAll(/:([-\w]+)/g)).map(result => result[1]);
        params = Object.fromEntries(keys.map((key, i) => {
            return [key, values[i]];
        }));

        getRouteParamsCache[`${route.path}-${route.match.input}`] = params;

    }

    return params;

};

const runFns = async function (fns, ...params) {
    for (const fn of fns) {
        await fn(...params);
    }
};

const runRoutes = async function (routes, basePath, url) {

    let currPath, finalRoute;

    for (let currRoute of routes) {

        currPath = joinPath(basePath, currRoute.path);

        if (currRoute.type === 'USE') {
            await runFns(currRoute.fns, url);
        }

        if (currRoute.type === 'PATH') {
            currRoute.match = matchRegex(url.pathname, pathToRegex(currPath));
            if (currRoute.match !== null) {
                finalRoute = currRoute;
                break;
            }
            continue;
        }

        if (currRoute.type === 'ROUTE' && formatURL(url.pathname).startsWith(formatURL(currPath))) {
            currRoute = await runRoutes(currRoute.router.routes, currPath, url);
            if (currRoute && currRoute.match !== null) {
                finalRoute = currRoute;
                break;
            }
        }

    }

    return finalRoute;

};

const notFoundRoute = {
    type: '404',
    path: '/404',
    match: null,
    params: {},
    fns: [(route, url) => {
        throw Error(`Error 404 : ${url.href} not found`);
    }]
};

const notFoundHook = async (route, url) => {

    if (route) route.params = getRouteParams(route);
    else route = notFoundRoute;

    await runFns(route.fns, route, url);

}

/* Router */

const Router = function () {
    this.routes = [];
    this.hooks = {
        pre: [],
        post: [notFoundHook]
    };
    this.opts = {
        matchLink: 'link',
        matchTitle:'title'
    };
};

// Public API

Router.prototype.pre = function (...fns) {
    // add fns
    this.hooks.pre.push(...fns);

    // return this
    return this;
};

Router.prototype.post = function (...fns) {
    // add fns
    this.hooks.post.push(...fns);

    // return this
    return this;
};

Router.prototype.use = function (...fns) {
    // create route
    const route = {
        type: 'USE',
        fns: fns
    };

    // add route
    this.routes.push(route);

    // return this
    return this;
};

Router.prototype.path = function (path, ...fns) {
    // create route
    const route = {
        type: 'PATH',
        path: path,
        fns: fns
    };

    // add route
    this.routes.push(route);

    // return this
    return this;
};

Router.prototype.route = function (path, router) {
    // create route
    const route = {
        type: 'ROUTE',
        path: path,
        router: router
    };

    // add route
    this.routes.push(route);

    // return this
    return this;
};

Router.prototype.run = async function (url) {

    // URL
    if (!url) url = new URL(formatURL(location.href));
    else if (!url.pathname) url = new URL(formatURL(location.origin + url));

    // run pre hooks
    await runFns(this.hooks.pre, url);

    // run routes
    const route = await runRoutes(this.routes, '/', url);

    // run post hooks
    await runFns(this.hooks.post, route, url);

};

Router.prototype.to = async function (url, {reload = false, title = null, data = null, replace = false} = {}) {

    url = formatURL(url);

    if (!reload && (url === formatURL(location.href))) {
        history.replaceState(data, title, url);
        await this.run();
    } else {
        url = new URL(url, location.origin);
        if (replace) history.replaceState(data, title, url);
        else history.pushState(data, title, url.href);
        await this.run(url);
    }

};

Router.start = function (router) {
    router.run();
    window.addEventListener('popstate', router.run.bind(router, undefined));
    document.body.addEventListener('click', (e) => {
        const el = e.target.closest('a');
        if (el?.hasAttributes(router.opts.matchLink) === true) {
            e.preventDefault();
            const href = el.getAttribute('href');

            if (formatPath(href) === location.pathname) {
                router.to(href, {
                    title: el.getAttribute(router.opts.matchTitle),
                    replace: true
                });
            } else {
                router.to(href, {
                    title: el.dataset[router.opts.matchTitle],
                });
            }
        }
    });
};

/* ==== export ==== */

export default Router;
