import fs from 'fs';
import path from 'path';
import { getDirs } from './utils';

function findModules(modulesPath) {
  let dirs = getDirs(modulesPath);
  let namespaces = [];

  let modulesToLink = dirs.filter(dir => {
    if (dir.indexOf('@') > -1) {
      namespaces.push(dir);
    }
    return checkModule(modulesPath, dir);
  });

  if (namespaces.length > 0) {
    namespaces.forEach(namespace => {
      let submodules = findModules(path.join(modulesPath, namespace)).map(
        (value, index) => `${namespace}/${value}`
      );
      if (submodules && submodules.length > 0) {
        modulesToLink = modulesToLink.concat(submodules);
      }
    });
  }

  return modulesToLink;
}

function checkModule(modulePath, moduleDirectory) {
  let modulePackage;

  try {
    modulePackage = require(`${modulePath}/${moduleDirectory}/package.json`);
  } catch (e) {
    return false;
  }

  if (
    modulePackage &&
    (modulePackage.dependencies && modulePackage.dependencies['@syr/core'])
  ) {
    return true;
  }

  return false;
}

export { findModules };