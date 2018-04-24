/*
 * Copyright (C) 2018 Ericsson and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable, inject } from "inversify";
import { WidgetManager, FrontendApplicationContribution, FrontendApplication } from "@theia/core/lib/browser";
import { MaybePromise, Disposable } from "@theia/core/lib/common";
import { EditorWidget, Range } from "@theia/editor/lib/browser";
import { MonacoEditor } from "@theia/monaco/lib/browser/monaco-editor";
// import { /* tokenize, languages, */ Token } from 'prismjs';

import '../../src/browser/prism/prism.css';
import '../../src/browser/prism/prism.js';

// tslint:disable-next-line
declare var Prism: any;
// import * as prismjs from 'prismjs';
// import '../../src/browser/prism/prism.css';
// import * as prismjs from '../../src/browser/prism/prism.js';
// import * as prismjs from './prism/prismjs';
// import * as prismjs from './prism/prismjs.js';

// prismjs.tokenize

@injectable()
export class SyntaxHighlightingService implements FrontendApplicationContribution {

    private editors = new Set<MonacoEditor>();
    private timer: Disposable;

    @inject(WidgetManager) protected readonly widgetManager: WidgetManager;

    onStart?(app: FrontendApplication): MaybePromise<void> {
        this.widgetManager.onDidCreateWidget(e => {
            if (e.widget instanceof EditorWidget) {
                if (e.widget.editor instanceof MonacoEditor) {
                    const monaco = e.widget.editor;
                    this.editors.add(monaco);
                    monaco.onDocumentContentChanged(e => {
                        this.timer.dispose();
                        const t = setTimeout(() => {
                            this.handleChanges(monaco);
                        }, 200);
                        this.timer = Disposable.create(() => clearTimeout(t));
                    });
                    monaco.getControl().getModel().onDidChangeContent(content => {
                        this.handleChanges(monaco);
                    });
                    this.handleChanges(monaco);
                }
            }
        });
    }

    protected handleChanges(editor: MonacoEditor): void {
        const e = editor.document;
        const text = e.getText();
        if (text) {
            // const language = editor.getControl().getModel().getModeId();
            // const tokens = tokenize(text, languages['typescript']);
            const tokens = Prism.tokenize(text, Prism.languages.typescript) as Array<any>;

            const classifications: Classification[] = [];

            let pos = 0;
            const lines = text.split('\n').map(line => line.length);
            tokens.forEach(token => {
                // if (typeof token === 'string') {

                // } else {
                const { offset: startOffset, line: startLine } = this.getLineNumberAndOffset(pos, lines);
                const { offset: endOffset, line: endLine } = this.getLineNumberAndOffset(pos + token.length, lines);
                classifications.push({
                    start: pos + 1 - startOffset,
                    end: pos + 1 + token.length - endOffset,
                    kind: token.type,
                    startLine,
                    endLine
                });
                pos += token.length;
                // }
            });

            // const decorations: EditorDecoration[] = classifications.map(classification => {
            //     return {
            //         range:
            //     }
            // });
            const decorations = classifications.map(classification => ({
                range: Range.create(
                    classification.startLine,
                    classification.start,
                    classification.endLine,
                    classification.end
                ),
                options: {
                    className: classification.kind
                }
            }));

            // editor.
            editor.deltaDecorations({ uri: editor.uri.toString(), newDecorations: decorations, oldDecorations: [] });
        }
        // const lines = text.split(/\r\n|\r|\n/);
        // this.tmServer.parse(e.uri, lines).then(val => {
        //     this.createAnnotations(lines, val, editor);
        // }).catch(e => {
        //     console.error(e);
        // });
    }

    private getLineNumberAndOffset(start: number, lines: number[]): { line: number, offset: number } {
        let line = 0;
        let offset = 0;
        while (offset + lines[line] < start) {
            offset += lines[line] + 1;
            line += 1;
        }
        return { line: line + 1, offset };
    }
}

export class Classification {
    start: number;
    end: number;
    kind: string;
    startLine: number;
    endLine: number;
}
