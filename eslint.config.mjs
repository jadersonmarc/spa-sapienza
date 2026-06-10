import nextCoreWebVitals from "eslint-config-next/core-web-vitals"
import nextTypescript from "eslint-config-next/typescript"

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Prefixo _ marca variável intencionalmente não usada
      // (ex.: fontes next/font instanciadas só pelo @font-face)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
      ],
    },
  },
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      // Código gerado pelo shadcn/ui — não mantido manualmente
      "components/ui/**",
      "hooks/use-mobile.ts",
      "hooks/use-toast.ts",
    ],
  },
]

export default eslintConfig
