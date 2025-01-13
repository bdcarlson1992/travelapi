"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingSpinner = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const LoadingSpinner = () => ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center h-64", children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-4 text-gray-600", children: "Finding your perfect destinations..." })] }));
exports.LoadingSpinner = LoadingSpinner;
