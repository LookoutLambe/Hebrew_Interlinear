// Root lookup: rootMap -> stripPrefixes -> extractRoot
import { rootMap } from '../data/rootMap';
import { stripPrefixes, extractRoot, stripNikkud } from './hebrew';

export function getRoot(hw: string): string {
  if (rootMap[hw]) return rootMap[hw];
  const stripped = stripPrefixes(hw);
  if (rootMap[stripped]) return rootMap[stripped];
  return extractRoot(stripNikkud(stripped));
}
