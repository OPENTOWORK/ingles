/**
 * Brand tagline — Learn. Practise. Improve. (multi-color, bold sans-serif).
 */
export default function DraloTagline({ className = '', as: Tag = 'p' }) {
  return (
    <Tag className={`dralo-tagline${className ? ` ${className}` : ''}`}>
      <span className="dralo-tagline__learn">Learn.</span>{' '}
      <span className="dralo-tagline__practise">Practise.</span>{' '}
      <span className="dralo-tagline__improve">Improve.</span>
    </Tag>
  );
}
