import React, { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Button,
  Badge,
  Input
} from '@boredkevin/ui';
import { ShieldCheck, ExternalLink, ChevronDown, ChevronUp, Search, Scale } from 'lucide-react';

interface DependencyLicense {
  name: string;
  version: string;
  license: string;
  description: string;
  url: string;
  licenseText: string;
}

const GLASSIFY_LICENSE = `MIT License

Copyright (c) 2026 BoredKevin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

const DEPENDENCIES: DependencyLicense[] = [
  {
    name: '@boredkevin/ui',
    version: '^0.2.0',
    license: 'MIT',
    description: 'Precision-crafted sci-fi themed, pitch-dark UI component system built on Radix UI.',
    url: 'https://github.com/BoredKevin/ui',
    licenseText: `MIT License

Copyright (c) 2026 BoredKevin

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.`
  },
  {
    name: 'react',
    version: '^19.2.8',
    license: 'MIT',
    description: 'The JavaScript library for building modern user interfaces.',
    url: 'https://github.com/react/react',
    licenseText: `MIT License

Copyright (c) Meta Platforms, Inc. and affiliates.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.`
  },
  {
    name: 'react-dom',
    version: '^19.2.8',
    license: 'MIT',
    description: 'React package for working with the DOM.',
    url: 'https://github.com/react/react',
    licenseText: `MIT License

Copyright (c) Meta Platforms, Inc. and affiliates.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.`
  },
  {
    name: 'lucide-react',
    version: '^1.40.0',
    license: 'ISC',
    description: 'Beautiful & consistent icon toolkit made by the community.',
    url: 'https://github.com/lucide-icons/lucide',
    licenseText: `ISC License

Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) 2022-present Lucide Contributors.

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.`
  },
  {
    name: 'piexifjs',
    version: '^1.0.6',
    license: 'MIT',
    description: 'Read and modify EXIF data in JPEG and WebP images purely in JavaScript.',
    url: 'https://github.com/hMatoba/piexifjs',
    licenseText: `MIT License

Copyright (c) 2014, 2018 hMatoba

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.`
  },
  {
    name: 'tailwindcss',
    version: '^3.4.19',
    license: 'MIT',
    description: 'A utility-first CSS framework for rapidly building custom user interfaces.',
    url: 'https://github.com/tailwindlabs/tailwindcss',
    licenseText: `MIT License

Copyright (c) Tailwind Labs, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.`
  },
  {
    name: 'vite',
    version: '^8.2.2',
    license: 'MIT',
    description: 'Next generation frontend development tooling and bundler.',
    url: 'https://github.com/vitejs/vite',
    licenseText: `MIT License

Copyright (c) 2019-present, VoidZero Inc. & Vite Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.`
  },
  {
    name: 'typescript',
    version: '^7.0.2',
    license: 'Apache-2.0',
    description: 'TypeScript is a language for application-scale JavaScript development.',
    url: 'https://github.com/microsoft/TypeScript',
    licenseText: `Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

Copyright Microsoft Corporation. Licensed under the Apache License, Version 2.0.`
  }
];

export const LicensesModal: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);
  const [showGlassifyLicense, setShowGlassifyLicense] = useState(false);

  const filteredDependencies = DEPENDENCIES.filter((dep) => {
    const q = searchQuery.toLowerCase();
    return (
      dep.name.toLowerCase().includes(q) ||
      dep.license.toLowerCase().includes(q) ||
      dep.description.toLowerCase().includes(q)
    );
  });

  const togglePackage = (name: string) => {
    setExpandedPackage((prev) => (prev === name ? null : name));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="hover:text-foreground hover:underline transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-sm"
        >
          Licenses
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-semibold tracking-tight">
                Open Source Licenses
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Glassify is free and open-source software (FOSS). We gratefully acknowledge the open-source projects that power this application.
          </DialogDescription>
        </DialogHeader>

        {/* Search bar */}
        <div className="relative pt-3 pb-1">
          <Search className="absolute left-3 top-5.5 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter dependencies by name or license..."
            className="pl-8 text-xs h-9 bg-card/60"
          />
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 pt-1 text-left">
          {/* Main App License Card */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2.5 transition-all">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">Glassify</span>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider border-primary/30 text-primary">
                    MIT License
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Web-based image processing utility for Meta Glasses media. Copyright © 2026 BoredKevin.
                </p>
              </div>
              <a
                href="https://github.com/boredkevin/glassify"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors p-1"
                title="View GitHub Repository"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowGlassifyLicense(!showGlassifyLicense)}
                className="text-[11px] font-mono text-primary/90 hover:text-primary hover:underline flex items-center gap-1 cursor-pointer transition-colors"
              >
                {showGlassifyLicense ? (
                  <>
                    <ChevronUp className="w-3 h-3" /> Hide full license
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" /> View full MIT license
                  </>
                )}
              </button>

              {showGlassifyLicense && (
                <pre className="mt-2 p-2.5 rounded-lg bg-background/80 border border-border/40 text-[10px] font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {GLASSIFY_LICENSE}
                </pre>
              )}
            </div>
          </div>

          {/* Third party dependencies */}
          <div className="pt-1">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-medium text-foreground tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                Third-Party Dependencies ({filteredDependencies.length})
              </span>
            </div>

            <div className="space-y-2">
              {filteredDependencies.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No matching dependencies found.
                </div>
              ) : (
                filteredDependencies.map((dep) => {
                  const isExpanded = expandedPackage === dep.name;
                  return (
                    <div
                      key={dep.name}
                      className="rounded-lg border border-border/50 bg-card/40 p-3 space-y-1.5 transition-all hover:border-border"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-xs font-semibold text-foreground">
                              {dep.name}
                            </span>
                            <span className="font-mono text-[11px] text-muted-foreground/70">
                              {dep.version}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[10px] font-mono py-0 px-1.5 border-border/60 text-muted-foreground"
                            >
                              {dep.license}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-snug">
                            {dep.description}
                          </p>
                        </div>
                        <a
                          href={dep.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors p-1 shrink-0"
                          title={`Open ${dep.name} repository`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <button
                        type="button"
                        onClick={() => togglePackage(dep.name)}
                        className="text-[11px] font-mono text-muted-foreground hover:text-foreground hover:underline flex items-center gap-1 cursor-pointer transition-colors pt-0.5"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3" /> Hide license notice
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" /> View license notice
                          </>
                        )}
                      </button>

                      {isExpanded && (
                        <pre className="mt-1.5 p-2 rounded-md bg-background/90 border border-border/40 text-[10px] font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap leading-relaxed">
                          {dep.licenseText}
                        </pre>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border/40 flex justify-end">
          <DialogClose asChild>
            <Button variant="outline" className="text-xs h-8 px-4">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
