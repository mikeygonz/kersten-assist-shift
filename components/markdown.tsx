/* eslint-disable @typescript-eslint/no-unused-vars */
import Link from "next/link"
import { memo } from "react"
import ReactMarkdown, { type Components } from "react-markdown"

const components: Partial<Components> = {
  code: ({ node: _node, children, ...props }) => {
    return (
      <code className="bg-gray-100 p-1 rounded-sm" {...props}>
        {children}
      </code>
    )
  },
  pre: ({ children }) => <>{children}</>,
  ol: ({ node: _node, children, ...props }) => {
    return (
      <ol className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ol>
    )
  },
  li: ({ node: _node, children, ...props }) => {
    return (
      <li className="py-1" {...props}>
        {children}
      </li>
    )
  },
  ul: ({ node: _node, children, ...props }) => {
    return (
      <ul className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ul>
    )
  },
  strong: ({ node: _node, children, ...props }) => {
    return (
      <span className="font-medium" {...props}>
        {children}
      </span>
    )
  },
  em: ({ node: _node, children, ...props }) => {
    return (
      <span className="italic" {...props}>
        {children}
      </span>
    )
  },
  a: ({ node: _node, children, ...props }) => {
    return (
      // @ts-expect-error link is not a valid node
      <Link className="text-blue-500 hover:underline" target="_blank" rel="noreferrer" {...props}>
        {children}
      </Link>
    )
  },
  h1: ({ node: _node, children, ...props }) => {
    return (
      <h1 className="text-3xl font-medium mt-6 mb-2" {...props}>
        {children}
      </h1>
    )
  },
  h2: ({ node: _node, children, ...props }) => {
    return (
      <h2 className="text-2xl font-medium mt-6 mb-2" {...props}>
        {children}
      </h2>
    )
  },
  h3: ({ node: _node, children, ...props }) => {
    return (
      <h3 className="text-xl font-medium mt-6 mb-2" {...props}>
        {children}
      </h3>
    )
  },
  h4: ({ node: _node, children, ...props }) => {
    return (
      <h4 className="text-lg font-medium mt-6 mb-2" {...props}>
        {children}
      </h4>
    )
  },
  h5: ({ node: _node, children, ...props }) => {
    return (
      <h5 className="text-base font-medium mt-6 mb-2" {...props}>
        {children}
      </h5>
    )
  },
  h6: ({ node: _node, children, ...props }) => {
    return (
      <h6 className="text-sm font-medium mt-6 mb-2" {...props}>
        {children}
      </h6>
    )
  },
}

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  return <ReactMarkdown components={components}>{children}</ReactMarkdown>
}

export const Markdown = memo(NonMemoizedMarkdown, (prevProps, nextProps) => prevProps.children === nextProps.children)
