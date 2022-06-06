import { visit } from 'unist-util-visit';
import { h } from 'hastscript';

/**
 * https://github.com/remarkjs/remark-directive#example-styled-blocks
 */
export function remarkAdmonitions() {
  return (tree) => {
    visit(tree, (node) => {
      if (
        node.type === 'textDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'containerDirective'
      ) {
        if (node.name !== 'note' && node.name !== 'note-danger') return;

        const data = node.data || (node.data = {});
        const tagName = node.type === 'textDirective' ? 'span' : 'div';

        if (node.attributes.class === undefined || node.attributes.class === "") {
          node.attributes.class = `note`;
        }

        if (node.name === 'note' || node.name === 'note-info') {
          node.attributes.class = `admonition admonition-info`;
        } else if (node.name === 'note-danger') {
          node.attributes.class = `admonition admonition-danger`;
        }

        data.hName = tagName;
        data.hProperties = h(tagName, node.attributes).properties;
      }
    });
  };
}