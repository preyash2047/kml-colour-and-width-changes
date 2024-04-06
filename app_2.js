import fs from 'fs';
import { DOMParser, XMLSerializer } from 'xmldom';
import axios from 'axios';

class KMLUtility {
    constructor(kmlContent) {
        if (kmlContent.startsWith('http')) {
            // KML content is a URL, fetch it
            this.fetchKMLFromURL(kmlContent);
        } else {
            // KML content is provided directly
            this.kmlString = kmlContent;
            this.parser = new DOMParser();
            this.serializer = new XMLSerializer();
            this.xmlDoc = this.parser.parseFromString(this.kmlString, 'text/xml');
        }
    }

    async fetchKMLFromURL(url) {
        try {
            const response = await axios.get(url);
            this.kmlString = response.data;
            this.parser = new DOMParser();
            this.serializer = new XMLSerializer();
            this.xmlDoc = this.parser.parseFromString(this.kmlString, 'text/xml');
        } catch (error) {
            throw new Error('Error fetching KML from URL: ' + error.message);
        }
    }

    applyLineColour(lineColour) {
        try {
            const styleNodes = this.xmlDoc.getElementsByTagName('Style');
            for (let i = 0; i < styleNodes.length; i++) {
                const styleNode = styleNodes[i];
                const lineStyleNode = styleNode.getElementsByTagName('LineStyle')[0];

                if (!lineStyleNode) {
                    const newLineStyleNode = this.xmlDoc.createElement('LineStyle');
                    styleNode.appendChild(newLineStyleNode);
                }

                const widthNode = lineStyleNode.getElementsByTagName('width')[0] || this.xmlDoc.createElement('width');
                widthNode.textContent = '4'; // Set line width to 4
                lineStyleNode.appendChild(widthNode);

                const colorNode = lineStyleNode.getElementsByTagName('color')[0] || this.xmlDoc.createElement('color');
                colorNode.textContent = this.rgbToKMLColor(lineColour, 50); // Set line color
                lineStyleNode.appendChild(colorNode);
            }
        } catch (error) {
            throw new Error('Error applying line colour to KML: ' + error.message);
        }
    }

    applyFillColour(fillColour, transparency) {
        try {
            const styleNodes = this.xmlDoc.getElementsByTagName('Style');
            for (let i = 0; i < styleNodes.length; i++) {
                const styleNode = styleNodes[i];
                const polyStyleNode = styleNode.getElementsByTagName('PolyStyle')[0];

                if (!polyStyleNode) {
                    const newPolyStyleNode = this.xmlDoc.createElement('PolyStyle');
                    styleNode.appendChild(newPolyStyleNode);
                }

                const colorNode = polyStyleNode.getElementsByTagName('color')[0] || this.xmlDoc.createElement('color');
                colorNode.textContent = this.rgbToKMLColor(fillColour, transparency); // Set fill color with transparency
                polyStyleNode.appendChild(colorNode);
            }
        } catch (error) {
            throw new Error('Error applying fill colour to KML: ' + error.message);
        }
    }

    applyLineWidth(lineWidth) {
        try {
            const styleNodes = this.xmlDoc.getElementsByTagName('Style');
            for (let i = 0; i < styleNodes.length; i++) {
                const styleNode = styleNodes[i];
                const lineStyleNode = styleNode.getElementsByTagName('LineStyle')[0];
                if (lineStyleNode) {
                    const widthNode = lineStyleNode.getElementsByTagName('width')[0];
                    if (widthNode) {
                        widthNode.textContent = lineWidth.toString(); // Set line width
                    } else {
                        const newWidthNode = this.xmlDoc.createElement('width');
                        newWidthNode.textContent = lineWidth.toString();
                        lineStyleNode.appendChild(newWidthNode);
                    }
                }

                const polyStyleNode = styleNode.getElementsByTagName('PolyStyle')[0];
                if (polyStyleNode) {
                    const widthNode = polyStyleNode.getElementsByTagName('width')[0];
                    if (widthNode) {
                        widthNode.textContent = lineWidth.toString(); // Set line width for polygon
                    } else {
                        const newWidthNode = this.xmlDoc.createElement('width');
                        newWidthNode.textContent = lineWidth.toString();
                        polyStyleNode.appendChild(newWidthNode);
                    }
                }
            }
        } catch (error) {
            throw new Error('Error applying line width to KML: ' + error.message);
        }
    }

    writeToFile(outputFilePath) {
        const modifiedKMLString = this.serializer.serializeToString(this.xmlDoc);
        fs.writeFileSync(outputFilePath, modifiedKMLString, 'utf8');
    }

    rgbToKMLColor(rgb, transparency = 100) {
        const r = parseInt(rgb.slice(1, 3), 16);
        const g = parseInt(rgb.slice(3, 5), 16);
        const b = parseInt(rgb.slice(5, 7), 16);
        const a = Math.round((transparency / 100) * 255);
        return `${this.toHex(a)}${this.toHex(b)}${this.toHex(g)}${this.toHex(r)}`;
    }

    toHex(d) {
        return ('0' + d.toString(16)).slice(-2).toUpperCase();
    }
}

// Example usage:

// Read KML directly from text
// const kmlContent = fs.readFileSync('SMC.kml', 'utf8');
// const kmlUtility = new KMLUtility(kmlContent);

// Or read KML from an S3 URL
// const kmlURL = 'your-s3-url';
// const kmlUtility = new KMLUtility(kmlURL);

// Apply line color
// kmlUtility.applyLineColour('#000000');

// Apply line width
// kmlUtility.applyLineWidth(5);

// Apply fill color with transparency
// kmlUtility.applyFillColour('#ff0080', 50);

// Write modified KML to a new file
// const outputFilePath = 'output.kml';
// kmlUtility.writeToFile(outputFilePath);
