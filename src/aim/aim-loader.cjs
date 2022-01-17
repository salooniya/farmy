const fs = require("fs");
const path = require("path");
const css = fs.readFileSync(path.resolve(__dirname, './output.css'), 'utf-8');


// AIM loader
const AIMLoader = function (code) {
    let regex, matches;

    /*
    * class: 'fz-x1 c-red';
    */
    regex = /class:\s'([^;]+)';/g;
    matches = Array.from(code.matchAll(regex));
    matches.forEach(match => {
        const classes = match[1].split(' ');
        let cssProps = '';
        classes.forEach(cls => {
            if (cls.startsWith('h--')) {
                const match = css.match(new RegExp(`\\.${cls}:hover\\s{([^}]+)}`, 'i'));
                cssProps += match ? match[1] : '';
            } else {
                const match = css.match(new RegExp(`\\.${cls}\\s{([^}]+)}`, 'i'));
                cssProps += match ? match[1] : '';
            }
        });
        const x = `/* ==== ${match[1]} */` + cssProps + `/* ==== */`;
        code = code.replace(match[0], x);
    });

    // return code
    return code;
};

// Complete farmy loader
const farmyLoader = function (code) {

    // AIM loader
    code = AIMLoader(code);

    // return code
    return code;

};

exports.default = function (source, map) {
    this.callback(
        null,
        farmyLoader(source),
        map
    );
};
