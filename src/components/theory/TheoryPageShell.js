'use client';

import dynamic from 'next/dynamic';
import { Children, cloneElement, isValidElement } from 'react';
import { TheorySection } from '@/components/theory/TheoryContent';

const TheoryInlinePractice = dynamic(
  () => import('@/components/theory/TheoryInlinePractice').then((m) => m.TheoryInlinePractice),
  { ssr: false, loading: () => null },
);

export const THEORY_PAGE_WRAPPER_STYLE = {
  border: '1px solid #bfdbfe',
  borderRadius: '16px',
  padding: '1rem',
  background: 'linear-gradient(180deg, #fafbff 0%, #fff 100%)',
};

function injectPracticeIntoFirstSection(node, topicTitle) {
  if (!isValidElement(node)) return node;

  if (node.type === TheorySection) {
    return cloneElement(
      node,
      {},
      <>
        {node.props.children}
        <TheoryInlinePractice topicTitle={topicTitle} embedded />
      </>,
    );
  }

  if (node.props?.children) {
    let injected = false;
    const nextChildren = Children.map(node.props.children, (child) => {
      if (injected || !isValidElement(child)) return child;
      if (child.type === TheorySection) {
        injected = true;
        return cloneElement(
          child,
          {},
          <>
            {child.props.children}
            <TheoryInlinePractice topicTitle={topicTitle} embedded />
          </>,
        );
      }
      return child;
    });
    if (injected) {
      return cloneElement(node, {}, nextChildren);
    }
  }

  return node;
}

export function TheoryPageShell({ children, topicTitle, enableInlinePractice = true }) {
  const content =
    enableInlinePractice && topicTitle
      ? injectPracticeIntoFirstSection(children, topicTitle)
      : children;

  return <div style={THEORY_PAGE_WRAPPER_STYLE}>{content}</div>;
}
