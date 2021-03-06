/**
 * nfs-ps.js
 * Node.js utilities for crawling a local file system.
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
var path = require("path");
var fs = require("fs");

var NFSPS = {
    /**
     * Indicates how FileSystemCrawler will handle the files it encounters.
     * 
     * BY_FILE - cbparse callback invoked each time it encounters a file
     * ALL_FILES - cbparse callback invoked at end and passed an array of files
     */
    CrawlerMode: {
        BY_FILE: 0,
        ALL_FILES: 1
    },
    
    /**
     * Indicates which files/directories FileSystem crawler will return to the 
     * cbparse callback.
     * 
     * ONLY_DIR - Returns only directories, no files
     * NO_DIR - Returns all files, no directories
     */
    FilterMode: {
        ONLY_DIR: 0,
        NO_DIR: 1
    },
    
    /**
     * Utility which returns the extension of a file.
     * 
     * file - file path string
     */
    FileNameExtension: function(file) {
        return {
            get: function() {
                return path.extname(file);
            }
        };
    },

    /**
     * A utility for crawling a local file system. Takes the following JSON
     * argument map as a parameter:
     * 
     * config:
     *  dir - Directory path where the crawler should start
     *  mode - Indicates how crawler will call callback (see NFSPS.CrawlerMode)
     *  filter - Indicates the files crawler will return (see NFSPS.FilterMode)
     *  cbstart - Invoked when the directory crawler algorithm is started
     *  cbparse(err, data) - returns a file or an array of files (data)
     *  cbend - Invoked when the directory crawler algorithm has completed
     */
    FileSystemCrawler: function(config) {
        var results = [];
        
        /**
         * Determines whether to return a directory path back to the callback
         * based off the filter value.
         * 
         * dfile - directory path string
         */
        var inspectDirectory = function(dfile) {
            if (NFSPS.FilterMode.ONLY_DIR === config.filter) {
                if (config.mode === NFSPS.CrawlerMode.BY_FILE)
                    config.cbparse(null, dfile);
                else
                    results.push(dfile);
            }
        };
        
        /**
         * Determines whether to return a file path back to the callback based
         * off the filter value.
         * 
         * dfile - file path string
         */
        var inspectFile = function(dfile) {
            if (NFSPS.FilterMode.ONLY_DIR !== config.filter) {
                var extName = NFSPS.FileNameExtension(dfile).get();
                
                if(config.filter === extName || config.filter === "*") {
                    if (config.mode === NFSPS.CrawlerMode.BY_FILE)
                        config.cbparse(null, dfile);
                    else
                        results.push(dfile);
                }
            }
        };

        /**
         * Main crawler function, which is executed recursively to crawl a 
         * specified directory.
         * 
         * dir - Directory name for the crawler to visit/walk
         * finished - Callback invoked once the algorithm has completed
         */
        var walk = function(dir, finished) {
            fs.readdir(dir, function(err, list) {
                var pending = list.length;

                if (err || !pending)
                    return finished(err, results);

                list.forEach(function(file) {
                    var dfile = dir + "/" + file;

                    fs.stat(dfile, function(err, stat) {
                        // Recursively call walk to visit the new directory.
                        if (stat !== undefined && stat.isDirectory()) {
                            inspectDirectory(dfile);
                            
                            return walk(dfile, function(err, res) {
                                !--pending && finished(null, results);
                            });
                        }

                        inspectFile(dfile);

                        !--pending && finished(null, results);
                    });
                });
            });
        };

        return {
            /**
             * Main method which starts the crawler utility.
             */
            crawl: function() {
                if (config.cbstart !== undefined)
                    config.cbstart();

                // cbend callbacks will be invoked depending on the mode.
                walk(config.dir, function(err, data) {

                    if (config.mode === NFSPS.CrawlerMode.ALL_FILES) {
                        config.cbend();
                        config.cbparse(err, data);
                    }

                    if (config.mode === NFSPS.CrawlerMode.BY_FILE)
                        config.cbend();
                });
            }
        };
    }
};

module.exports.NFSPS = NFSPS;
