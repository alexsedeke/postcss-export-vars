import postcss from 'postcss';
import test    from 'ava';
import fs      from 'fs';

import plugin from './';

const dummyCSS = `
  :root {
    --var-color1: rgb(255, 255, 200);
    --var-padding: 10px;
    --var-padding2: var(--var-padding);
  }

  $var-color2: rgb(30, 100, 255);
  $var-margin: 20px;
  $var-margin2: $var-margin;
`;

const dummyJSON = { varColor1: 'rgb(255, 255, 200)', varPadding :'10px', varPadding2 :'10px', varColor2: 'rgb(30, 100, 255)', varMargin :'20px', varMargin2 :'20px' };
const dummyLimitedJSON = { varColor1: 'rgb(255, 255, 200)', varColor2: 'rgb(30, 100, 255)' };
const dummyJS = `'use strict';\nconst varColor1 = 'rgb(255, 255, 200)';\nconst varPadding = '10px';\nconst varPadding2 = '10px';\nconst varColor2 = 'rgb(30, 100, 255)';\nconst varMargin = '20px';\nconst varMargin2 = '20px';\n`;

function run(t, input, output, opts = { }) {
    return postcss([ plugin(opts) ]).process(input)
        .then( result => {
            t.same(fs.readFileSync(opts.file, 'utf8'), output);
            t.same(result.warnings().length, 0);
        });
}

/* Write tests here */
test('Test JSON output', t => {
    return run(t, dummyCSS, JSON.stringify(dummyJSON), { file: './postcss_vars.json', type: 'json' });
});

test('Test JS output', t => {
    return run(t, dummyCSS, dummyJS, { file: './postcss_vars.js', type: 'js' });
});

test('Test limited JSON output', t => {
    return run(t, dummyCSS, JSON.stringify(dummyLimitedJSON), { file: './postcss_vars_limited.json', type: 'json', match: ['color'] });
});


