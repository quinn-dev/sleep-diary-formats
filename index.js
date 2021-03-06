/*
 * Web-based document reader
 *
 * This file contains functionality specific to the current site.
 *
 * For example code, see the reader.js files in this directory and its
 * subdirectories.
 *
 * Copyright 2020 Andrew Sayers <andrew-github.com@pileofstuff.org>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var diary_loader = new DiaryLoader(
    (diary,source) => {

        switch ( diary.file_format() ) {
        case "SleepAsAndroid":
        case "Sleepmeter":
        case "PleesTracker":
            location = "src/" + diary.file_format() + "/demo.html#" + diary.to("url");
            break;
        default:
            location = "src/Standard/demo#" + diary.to("url");
        }

    },
    (raw,source) => {
        alert( "This does not seem to be a sleep diary.\nPlease try another file." );
    }
);

document.getElementById("diary-input")
    .addEventListener( "change", event => diary_loader.load(event) );
