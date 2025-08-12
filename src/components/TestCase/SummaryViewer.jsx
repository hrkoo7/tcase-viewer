import React from 'react';

/**
 * Very small Markdown-like parser for common patterns we see in summaries:
 * This is intentionally conservative and avoids adding new libraries.
 */

function parseSummary(text = '') {
  if (!text) return [];

  const lines = text.replace(/\r/g, '').split('\n');

  const nodes = [];
  let i = 0;
  let inCodeBlock = false;
  let codeBuffer = [];

  while (i < lines.length) {
    const line = lines[i];

    // Code block fence
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBuffer = [];
      } else {
        // close block
        nodes.push({ type: 'codeBlock', content: codeBuffer.join('\n') });
        inCodeBlock = false;
        codeBuffer = [];
      }
      i += 1;
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      i += 1;
      continue;
    }

    // Heading
    const hMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (hMatch) {
      const level = hMatch[1].length;
      nodes.push({ type: 'heading', level, content: hMatch[2] });
      i += 1;
      continue;
    }

    // Bullet list (collect consecutive)
    if (line.trim().match(/^([-*]\s+|[0-9]+\.\s+)/)) {
      const items = [];
      while (i < lines.length && lines[i].trim().match(/^([-*]\s+|[0-9]+\.\s+)/)) {
        const itemText = lines[i].trim().replace(/^([-*]\s+|[0-9]+\.\s+)/, '');
        items.push(itemText);
        i += 1;
      }
      nodes.push({ type: 'list', items });
      continue;
    }

    // blank line => paragraph separator
    if (line.trim() === '') {
      nodes.push({ type: 'paragraphBreak' });
      i += 1;
      continue;
    }

    // normal text (collect consecutive non-empty lines into a paragraph)
    const paraLines = [];
    while (i < lines.length && lines[i].trim() !== '') {
      paraLines.push(lines[i]);
      i += 1;
    }
    nodes.push({ type: 'paragraph', content: paraLines.join(' ') });
  }

  return nodes;
}

function inlineFormat(str) {
  // Replace inline code `code`
  const parts = [];
  let rest = str;

  // Simple parser for inline code and bold **bold**
  // We'll split on ` and ** in a safe order
  // First handle backticks
  const backtickParts = rest.split(/(`[^`]+`)/g);
  backtickParts.forEach((part) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      parts.push({ type: 'code', text: part.slice(1, -1) });
    } else {
      // inside non-code text, replace bold **text**
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      boldParts.forEach((b) => {
        if (b.startsWith('**') && b.endsWith('**')) {
          parts.push({ type: 'bold', text: b.slice(2, -2) });
        } else {
          // plain text
          if (b.length > 0) parts.push({ type: 'text', text: b });
        }
      });
    }
  });

  return parts;
}

export default function SummaryViewer({ summary }) {
  const nodes = parseSummary(summary);

  return (
    <div style={{
      border: '1px solid #e6e6e6',
      padding: 16,
      borderRadius: 8,
      background: '#fff',
      maxWidth: 980,
      marginTop: 16,
      fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      color: '#111827'
    }}>
      <h2 className="component-heading">🧪 Test Summary</h2>

      {nodes.map((node, idx) => {
        if (node.type === 'heading') {
          const Tag = `h${Math.min(6, node.level)}`;
          return <Tag key={idx} style={{ margin: '12px 0 8px', fontWeight: 700 }}>{node.content}</Tag>;
        }

        if (node.type === 'codeBlock') {
          return (
            <pre key={idx} style={{ background: '#111827', color: '#f8fafc', padding: 12, borderRadius: 6, overflowX: 'auto' }}>
              <code>{node.content}</code>
            </pre>
          );
        }

        if (node.type === 'list') {
          return (
            <ul key={idx} style={{ margin: '8px 0 12px 20px' }}>
              {node.items.map((it, i) => <li key={i}>{inlineFormat(it).map((part, p) => renderInline(part, `${idx}-${i}-${p}`))}</li>)}
            </ul>
          );
        }

        if (node.type === 'paragraph') {
          return (
            <p key={idx} style={{ margin: '6px 0', lineHeight: 1.6 }}>
              {inlineFormat(node.content).map((part, i) => renderInline(part, `${idx}-${i}`))}
            </p>
          );
        }

        // paragraphBreak -> render a small spacer
        if (node.type === 'paragraphBreak') {
          return <div key={idx} style={{ height: 8 }} />;
        }

        return null;
      })}
    </div>
  );
}

// helper to render inline parts
function renderInline(part, key) {
  if (!part) return null;
  if (part.type === 'code') return <code key={key} style={{ background: '#f3f4f6', padding: '0 6px', borderRadius: 4 }}>{part.text}</code>;
  if (part.type === 'bold') return <strong key={key}>{part.text}</strong>;
  return <span key={key}>{part.text}</span>;
}
