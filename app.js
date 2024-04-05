import fs from 'fs';
import { DOMParser, XMLSerializer } from 'xmldom';

function rgbToArgb(rgbColor, transparencyPercentage) {
    const hexColor = rgbColor.substring(1); // Remove '#' from the beginning
    const red = parseInt(hexColor.substring(0, 2), 16); // Extract red component
    const green = parseInt(hexColor.substring(2, 4), 16); // Extract green component
    const blue = parseInt(hexColor.substring(4, 6), 16); // Extract blue component
    const alpha = Math.round((transparencyPercentage / 100) * 255).toString(16).padStart(2, '0'); // Convert transparency percentage to hexadecimal
    return alpha + blue.toString(16).padStart(2, '0') + green.toString(16).padStart(2, '0') + red.toString(16).padStart(2, '0'); // Concatenate alpha and RGB color
}


function addOrUpdateStyle(kmlString, lineWidth, lineColor, fillTransparency, fillColor) {
    const parser = new DOMParser();
    const serializer = new XMLSerializer();
    const xmlDoc = parser.parseFromString(kmlString, 'text/xml');

    const documentNode = xmlDoc.getElementsByTagName('Document')[0];

    const placemarkNodes = documentNode.getElementsByTagName('Placemark');
    for (let i = 0; i < placemarkNodes.length; i++) {
        const placemarkNode = placemarkNodes[i];
        let styleUrlNode = placemarkNode.getElementsByTagName('styleUrl')[0];
        if (!styleUrlNode) {
            styleUrlNode = xmlDoc.createElement('styleUrl');
            styleUrlNode.appendChild(xmlDoc.createTextNode('#__managed_style_093FF8B01F2FCE7FD363'));
            placemarkNode.appendChild(styleUrlNode);
        }
    }

    const cascadingStyles = xmlDoc.getElementsByTagName('gx:CascadingStyle');
    for (let i = 0; i < cascadingStyles.length; i++) {
        const cascadingStyle = cascadingStyles[i];
        const styleNode = cascadingStyle.getElementsByTagName('Style')[0];

        let lineStyleNode = styleNode.getElementsByTagName('LineStyle')[0];
        if (!lineStyleNode) {
            lineStyleNode = xmlDoc.createElement('LineStyle');
            styleNode.appendChild(lineStyleNode);
        }
        let widthNode = lineStyleNode.getElementsByTagName('width')[0];
        if (!widthNode) {
            widthNode = xmlDoc.createElement('width');
            lineStyleNode.appendChild(widthNode);
        }
        widthNode.textContent = lineWidth.toString();

        let colorNode = lineStyleNode.getElementsByTagName('color')[0];
        if (!colorNode) {
            colorNode = xmlDoc.createElement('color');
            lineStyleNode.appendChild(colorNode);
        }
        colorNode.textContent = rgbToArgb(lineColor, fillTransparency);

        let polyStyleNode = styleNode.getElementsByTagName('PolyStyle')[0];
        if (!polyStyleNode) {
            polyStyleNode = xmlDoc.createElement('PolyStyle');
            styleNode.appendChild(polyStyleNode);
        }
        widthNode = polyStyleNode.getElementsByTagName('width')[0];
        if (!widthNode) {
            widthNode = xmlDoc.createElement('width');
            polyStyleNode.appendChild(widthNode);
        }
        widthNode.textContent = lineWidth.toString();

        colorNode = polyStyleNode.getElementsByTagName('color')[0];
        if (!colorNode) {
            colorNode = xmlDoc.createElement('color');
            polyStyleNode.appendChild(colorNode);
        }
        colorNode.textContent = rgbToArgb(fillColor, fillTransparency);
    }

    return serializer.serializeToString(xmlDoc);
}

// Function to read content from a file
function readFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

// Function to write content to a file
function writeFile(filePath, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, data, 'utf8', (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// Read content from the original KML file
readFile('SMC.kml')
    .then((originalKML) => {
        // Process the content to add or update styles
        const modifiedKML = addOrUpdateStyle(originalKML, 4, '#9929a3', 50, '#9929a3');

        // Write the modified content to a new file
        return writeFile('modified.kml', modifiedKML);
    })
    .then(() => {
        console.log('Modified KML file has been created successfully.');
    })
    .catch((err) => {
        console.error('An error occurred:', err);
    });