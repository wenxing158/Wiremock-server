var fs = require('fs-extra');

var newUser = process.argv[2];
var existingUser = process.argv[3];
var newSwid = process.argv[4];
var existingSwid = process.argv[5];
var newRefreshToken = process.argv[6];
var existingRefreshToken = process.argv[7];

if (!newUser || !existingUser || !newSwid || !existingSwid) {
    throw new Error('1 or more required arguments are missing.');
}

var sourcePrefix = 'android-' + existingUser.toLowerCase();
var sourceFilesFolderDir = '../__files/' + sourcePrefix;
var sourceMappingsFolderDir = '../mappings/' + sourcePrefix;

var targetPrefix = 'android-' + newUser.toLowerCase();
var targetFilesFolderDir = '../__files/' + targetPrefix;
var targetMappingsFolderDir = '../mappings/' + targetPrefix;

function copyDir(source, target, callback) {
    fs.copy(source, target, function(err) {
        if (err) {
            console.error('error copying dir ' + source + 'to ' + target, err);
        } else {
            callback();
        }
    });
}

function rename(collection, callback) {
    var completed = 0;
    collection.forEach(function(targetFile) {
        var replaced = targetFile.replace(sourcePrefix, targetPrefix);
        fs.rename(targetFile, replaced, function(err) {
            if (err) {
                console.log('error renaming file ' + targetFile, err);
            } else {
                completed++;
                if (completed >= collection.length) {
                    callback();
                }
            }
        });
    });
}

function copyFiles() {
    copyDir(sourceFilesFolderDir, targetFilesFolderDir, renameMappings);
}

function copyMappings() {
    copyDir(sourceMappingsFolderDir, targetMappingsFolderDir, copyFiles);
}

function renameMappings() {
    var targetMappings = fs.walkSync(targetMappingsFolderDir);
    rename(targetMappings, renameFiles);
}

function renameFiles() {
    var targetFiles = fs.walkSync(targetFilesFolderDir);
    rename(targetFiles, replaceMappingsReferences);
}

function replaceMappingsReferences() {
    var targetMappings = fs.walkSync(targetMappingsFolderDir);
    var completed = 0;
    targetMappings.forEach(function(mapping) {
        fs.readFile(mapping, 'utf8', function(err, data) {
            if (err) {
                return console.log('error opening ' + mapping, err);
            }
            var regex = new RegExp(sourcePrefix, 'g');
            var result = data.replace(regex, targetPrefix);
            var newLogin = 'android_';
            var oldLogin = 'android_';
            var newUserParts = newUser.split('-');
            var existingUserParts = existingUser.split('-');
            newUserParts.forEach(function(part, index) {
                if (index == newUserParts.length - 1) {
                    newLogin += part.toLowerCase() + '@domain.com';
                } else {
                    newLogin += part.toLowerCase() + '_';
                }
            });
            existingUserParts.forEach(function(part, index) {
                if (index == existingUserParts.length - 1) {
                    oldLogin += part.toLowerCase() + '@domain.com';
                } else {
                    oldLogin += part.toLowerCase() + '_';
                }
            });
            result = result.replace(oldLogin, newLogin);
            var swidRegEx = new RegExp(existingSwid, 'g');
            result = result.replace(swidRegEx, newSwid);
            var refreshTokenRegex = new RegExp(existingRefreshToken, 'g');
            result = result.replace(refreshTokenRegex, newRefreshToken);
            fs.writeFile(mapping, result, 'utf8', function(err) {
                if (err) {
                    return console.log('error writing file ' + mapping, err);
                } else {
                    completed++;
                    if (completed >= targetMappings.length) {
                        replaceFilesReferences();
                    }
                }
            });
        });
    });
}

function replaceFilesReferences() {
    var targetFiles = fs.walkSync(targetFilesFolderDir);
    var completed = 0;
    targetFiles.forEach(function(file) {
        fs.readFile(file, 'utf8', function(err, data) {
            if (err) {
                return console.log('error opening ' + file, err);
            }
            var swidRegEx = new RegExp(existingSwid, 'g');
            var result = data.replace(swidRegEx, newSwid);
            var newUserVisualId = 'Android';
            var existingUserVisualId = 'Android';
            var newUserParts = newUser.split('-');
            var existingUserParts = existingUser.split('-');
            var newLogin = 'android_';
            var oldLogin = 'android_';
            newUserParts.forEach(function(part, index) {
                newUserVisualId += part[0].toUpperCase() + part.slice(1, part.length);
                if (index == newUserParts.length - 1) {
                    newLogin += part.toLowerCase() + '@domain.com';
                } else {
                    newLogin += part.toLowerCase() + '_';
                }
            });
            existingUserParts.forEach(function(part, index) {
                existingUserVisualId += part[0].toUpperCase() + part.slice(1, part.length);
                if (index == existingUserParts.length - 1) {
                    oldLogin += part.toLowerCase() + '@domain.com';
                } else {
                    oldLogin += part.toLowerCase() + '_';
                }
            });
            var visualIdRegEx = new RegExp(existingUserVisualId, 'g');
            result = result.replace(visualIdRegEx, newUserVisualId);
            var loginRegex = new RegExp(oldLogin, 'g');
            result = result.replace(loginRegex, newLogin);
            var refreshTokenRegex = new RegExp(existingRefreshToken, 'g');
            result = result.replace(refreshTokenRegex, newRefreshToken);
            fs.writeFile(file, result, 'utf8', function(err) {
                if (err) {
                    return console.log('error writing file ' + file, err);
                } else {
                    completed++;
                    if (completed >= targetFiles.length) {
                        console.log('completed');
                    }
                }
            });
        });
    });
}

copyMappings();