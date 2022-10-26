const fs = require("fs-extra");
const path = require("path");

async function storeDeployment(
  hre,
  { name, address, abi }
) {
  const deploymentDir = getDefaultDeploymentPath(hre);
  await fs.ensureDir(deploymentDir);

  const deploymentJsonPath = path.join(deploymentDir, `deployment-${name}.json`);
  await fs.writeJson(deploymentJsonPath, {
    name,
    address,
    abi,
  });
}

function deploymentExists(hre, name) {
  const deploymentDir = getDefaultDeploymentPath(hre);
  const deploymentJsonPath = path.join(deploymentDir, `deployment-${name}.json`);
  return fs.pathExists(deploymentJsonPath);
}

function getDefaultDeploymentPath(hre) {
  return path.join(hre.config.paths.root, "deployment", hre.network.name);
}

/**
 * @param {boolean} a
 * @param {boolean} b
 * @returns {boolean}
 */
function xor(a, b) {
  return a !== b;
}

module.exports = {
  deploymentExists,
  storeDeployment,
  xor,
}