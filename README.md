# PostCSS Export Vars [![Build Status][ci-img]][ci]

[PostCSS] plugin to export variables definitions as JSON or JS constants.
It detect "custom variables" and SASS style variables.

This plugin was created for a project, witch should use defined css colors also for highcharts.
All suggestions are welcome!

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/nahody/postcss-export-vars.svg
[ci]:      https://travis-ci.org/nahody/postcss-export-vars

## Options
All options are mandatory.

**file**
Export file name. Extension is not required and will be set automatically.
Default file name is ```postcss_vars```

**type**
Export format. Default is JSON. Possible values are ```json``` and ```js```.

**match**
The match option is an array of string the property name / variable must contain to limit the result for a specific group of variables.
When option is missing or an empty array, all properties / variables are taken.

```json
{
    file: 'my-vars',
    type: 'js',
    match: ['-color', 'font']
}
```

## Example

**CSS Source:**
```css
:root {
    --var-color1: rgb(255, 255, 200);
    --var-padding: 10px;
}

$var-color2: rgb(30, 100, 255);
$var-margin: 20px;
```

**JSON Result:**
```JSON
{
	  "varColor1": "rgb(255, 255, 200)",
	  "varPadding": "10px",
	  "varColor2": "rgb(30, 100, 255)",
	  "varMargin": "20px"
}
```

**JavaScript Result:**
```JS
const varColor1 = 'rgb(255, 255, 200)';
const varPadding = '10px';
const varColor2 = 'rgb(30, 100, 255)';
const varMargin = '20px';
```

## Usage

```js
postcss([ require('postcss-export-vars') ])
```

See [PostCSS] docs for examples for your environment.

## Notice
The plugin DO NOT tranform your PostCSS. It collects all definition and converts them to the required format. Therefore, the export to a file must be made and can not stream as PostCSS be returned.
