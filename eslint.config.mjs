import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored prototype scripts, ported verbatim from Claude Design.
    "public/bg3d.js",
    "public/image-slot.js",
    // Vendored PDF runtime assets (pdf.js worker, qpdf-wasm glue).
    "public/pdf-editor/**",
  ]),
  {
    // The PDF editor is a faithful port of a Claude Design prototype (one
    // bundled module preserving its original shared-scope structure). Relax
    // stylistic/hook lint rules that don't apply to vendored prototype code.
    files: ["components/pdf-editor/**", "components/code-formatter/**"],
    rules: {
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/immutability": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@next/next/no-img-element": "off",
      "react/display-name": "off",
    },
  },
]);

export default eslintConfig;
