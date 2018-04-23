/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * A string that could be:
 *
 *  - one of the browser colors, (E.g.: `blue`, `red`, `magenta`),
 *  - the case insensitive hexadecimal color code, (for instance, `#ee82ee`, `#20B2AA`, `#f09` ), or
 *  - either the `rgb()` or the `rgba()` functions.
 *
 * For more details, see: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value.
 *
 * Note, it is highly recommended to use one of the predefined colors of Theia, so the desired color will
 * look nice with both the `light` and the `dark` theme too. For instance: `var(--theia-success-color0)`.
 */
export type Color = string;
