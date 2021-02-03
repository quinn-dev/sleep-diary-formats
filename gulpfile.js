const { series, src, dest } = require('gulp'),
    jasmine = require('gulp-jasmine'),
    closureCompiler = require('google-closure-compiler').gulp(),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    jsdoc = require('gulp-jsdoc3'),
    replace = require('gulp-replace'),
    git = require('gulp-git');

const formats = ['Standard', 'Sleepmeter', 'SleepAsAndroid', 'PleesTracker']
const diaryFiles = ['src/DiaryBase.js', ...formats.map(format => `src/${format}/format.js`)]

// Production
const outputDir = './'

// For testing purposes
// const outputDir = './dist'

function runTests() {
    return src('spec/support/jasmine.json')
        .pipe(jasmine({
            config: require('./spec/support/jasmine.json')
        }))
}

// Build test.js
function buildTests() {
    return src(['src/test-harness.js', ...formats.map(format => `src/${format}/test.js`)])
        .pipe(concat('test.js'))
        .pipe(dest(outputDir));
}

// Compile the library and the source map
function library() {
    const outputFile = 'sleep-diary-formats.js'

    return src(['src/closure-externs.js', 'src/closure.js', ...diaryFiles], { base: './' })
        .pipe(sourcemaps.init())
        .pipe(closureCompiler({
            compilation_level: 'ADVANCED_OPTIMIZATIONS',
            generate_exports: true,
            export_local_property_definitions: true,
            define: 'COMPILED=true',
            warning_level: 'VERBOSE',
            language_in: 'ECMASCRIPT_NEXT_IN',
            language_out: 'ECMASCRIPT3',
            isolation_mode: 'IIFE',
            js_output_file: outputFile
        }, {
            platform: ['native', 'java', 'javascript']
        }))
        .pipe(sourcemaps.write('/'))
        .pipe(dest(outputDir));
}

// Run JSDoc
function buildDocs(cb) {
    const config = {
        "templates": {
            "default": {
                "includeDate": false
            }
        },
        "opts": {
            "destination": `${outputDir}/doc`,
            "readme": "doc/README.md",
            "tutorials": "doc/tutorials",
            "template": "templates/default"
        }
    }

    src(diaryFiles, { base: './', read: false })
        .pipe(jsdoc(config, cb))
}

// Replace date on JSDoc-generated files
async function replaceDate() {
    const date = await new Promise((resolve, reject) => {
        // Get date of latest relevant commit from git
        git.exec({ args: `log -1 --format="%ci" doc/README.md ${diaryFiles.join(" ")} doc/tutorials` }, function (err, stdout) {
            err && reject(err)
            const date = new Date(stdout.trim())
            // Check if date is valid
            date.getTime() ? resolve(date.toString()) : reject(new Error(`Invalid date: ${stdout.trim()}`))
        });
    })

    //
    return src(`${outputDir}/doc/*.html`)
        .pipe(replace(/(?<=JSDoc \d.\d.\d<\/a>)(?=\s<\/footer>)/, ` on ${date}`))
        .pipe(dest(`${outputDir}/doc/`));
}

const docs = series(buildDocs, replaceDate)

exports.default = library
exports.test = runTests
exports.buildTests = buildTests
exports.docs = docs
exports.all = series(runTests, buildTests, library, docs)