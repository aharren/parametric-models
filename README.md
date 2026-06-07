# Parametric 3D and 2D Models

Parametric 3D and 2D models using JavaScript and [JSCAD](https://github.com/jscad/OpenJSCAD.org).

## Installation

Clone the Git repository and install dependencies via [Node](https://nodejs.org)'s `npm`:

```
git clone https://github.com/aharren/parametric-models.git
cd parametric-models
npm install --ignore-scripts
```

## Editing

Use [Visual Studio Code](https://code.visualstudio.com) and the [JSCAD Preview extension](https://marketplace.visualstudio.com/items?itemName=codingwell-net.codingwell-vscode-jscad). A preview of a model can be opened via the "Preview JSCAD Model" command, available in the command palette or context menu of the model file. Whenever the mode file is saved, the preview will update.

![](.readme/vscode-editor-preview-0.png)

## STL Creation for 3D Objects

Run the `model-to-stla` script and pass the name of the model file (or folder) to create an STL text file from the 3D objects in the model.

Examples:
```
./scripts/model-to-stla models/box/box.js
```
```
./scripts/model-to-stla models/box
```

## SVG Creation for 2D Objects

Run the `model-to-svg` script for creating an SVG file from the model's 2D objects.

Examples:
```
./scripts/model-to-svg models/router-guide-rail-rounded-plate/router-guide-rail-rounded-plate.js
```
```
./scripts/model-to-svg models/router-guide-rail-rounded-plate
```
