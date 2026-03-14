'use client'

import React from 'react'

import { BlogSearch } from './BlogSearch'
import { BlogCategories } from './BlogCategories'
import { BlogTags } from './BlogTags'
import { BlogNewsletter } from './BlogNewsletter'

export function BlogSidebar() {
  return (
    <aside className="space-y-6">
      <BlogSearch />
      <BlogCategories />
      <BlogTags />
      <BlogNewsletter />
    </aside>
  )
}