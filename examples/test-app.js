/**
 * nfs-ps.js; test-app.js
 * A Node.js utility for crawling a local file system.
 * Copyright (C) 2014 James M. Duran
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
 
/**
 * Test App
 *  Sample directory: ../
 */
var TESTAPP = (function() {
    var allFilesConfig = {
        dir: "../",
        mode: NFSPS.CrawlerMode.ALL_FILES,

        cbstart: function() {
            console.log("=== ALL_FILES crawler mode has begun ===");
        },

        cbparse: function(err, data) {
            data.forEach(function(file) {
                console.log("ALL_FILES: " + file);
            });
        },

        cbend: function() {
            console.log("=== ALL_FILES crawler mode has finished ===");
        }
    };

    var byFileConfig = {
        dir: "../",
        mode: NFSPS.CrawlerMode.BY_FILE,

        cbstart: function() {
            console.log("=== BY_FILE crawler mode has begun ===");
        },

        cbparse: function(err, data) {
            console.log("BY_FILE: " + data);
        },

        cbend: function() {
            console.log("=== BY_FILE crawler mode has finished ===");
        }
    };

    return {
        start: function() {
            var allFilesCrawler = new NFSPS.FileSystemCrawler(allFilesConfig);
            allFilesCrawler.crawl();

            var byFileCrawler = new NFSPS.FileSystemCrawler(byFileConfig);
            byFileCrawler.crawl();
        }
    };
})().start();