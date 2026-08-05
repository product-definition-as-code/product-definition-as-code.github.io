// Rehype plugin: tag inline artifact IDs with their family class so CSS can
// apply the PDaC color contract. The prefix text itself remains the primary
// (accessible) channel; color is reinforcement only.
const FAMILY = {
  ACT: 'act',
  JRN: 'jrn',
  UC: 'uc',
  BR: 'br',
  TERM: 'term',
  BC: 'term',
  FR: 'req',
  QR: 'req',
  CON: 'req',
  CHG: 'chg',
};
const ID_RE = /^(ACT|JRN|UC|BR|TERM|BC|FR|QR|CON|CHG)-[A-Z0-9][A-Z0-9-]*$|^(ACT|JRN|UC|BR|TERM|BC|FR|QR|CON|CHG)-$/;

function visit(node, fn) {
  if (!node) return;
  fn(node);
  if (node.children) for (const child of node.children) visit(child, fn);
}

export default function rehypePdacIds() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type !== 'element' || node.tagName !== 'code') return;
      if (!node.children || node.children.length !== 1) return;
      const child = node.children[0];
      if (child.type !== 'text') return;
      const m = child.value.match(ID_RE);
      if (!m) return;
      const prefix = (m[1] ?? m[2]);
      const family = FAMILY[prefix];
      if (!family) return;
      node.properties ??= {};
      const cls = node.properties.className;
      const classes = Array.isArray(cls) ? cls : cls ? [cls] : [];
      classes.push('pdac-id', `pdac-${family}`);
      node.properties.className = classes;
    });
  };
}
