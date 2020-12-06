// ©2016 Stefan Ababei and Codrin Fechete
// Authors: Stefan Ababei and Codrin Fechete
// v.1.0.1: + getLayerPositionAnchorSize
//
//
var AFUtils = (function handler(thisObj) {
	function getProjectItemByName(project, itemName, parentFolderName) {
		for (var i = 1; i <= project.numItems; i++) {
			if (project.item(i).name == itemName && (!parentFolderName || project.item(i).parentFolder.name == parentFolderName)) {
				return project.item(i);
			}
		}
		return null;
	}
	function getProjectItemsWithParentFolder(project, parentFolderName) {
		// Find Folder:
		var fld;
		var items = [];
		for (var i = 1; i <= project.numItems; i++) {
			if (project.item(i).name == parentFolderName && project.item(i).typeName == "Folder") {
				fld = project.item(i);
				break;
			}
		}
		if (!fld) {
			alert("Utils: getProjectItemsWithParentFolder: there is no folder with name: \r" + parentFolderName);
			return null;
		}
		for (var i = 1; i <= project.numItems; i++) {
			if (project.item(i).parentFolder.id == fld.id) {
				items.push(project.item(i));
			}
		}
		return items;
	}
	function getLayerPositionAnchorSize(layer, property, forceCreate) {
		switch (property) {
			case "position":
				if (layer instanceof TextLayer) {
					var animator = layer.property("ADBE Text Properties").property("ADBE Text Animators").property("position");
					if (animator) {
						return animator.property("ADBE Text Animator Properties").property("ADBE Text Position 3D");
					} else if (forceCreate) {
						animator = layer.property("ADBE Text Properties").property("ADBE Text Animators").addProperty("ADBE Text Animator");
						animator.name = "position";
						return animator.property("ADBE Text Animator Properties").addProperty("ADBE Text Position 3D");
					}
					return undefined;
				} else if (layer instanceof ShapeLayer) {
					return layer.property("ADBE Root Vectors Group").property("ADBE Vector Group").property("ADBE Vector Transform Group").property("ADBE Vector Position");
				}
				break;
			case "anchor":
				if (layer instanceof TextLayer) {
					var animator = layer.property("ADBE Text Properties").property("ADBE Text Animators").property("anchor");
					if (animator) {
						return animator.property("ADBE Text Animator Properties").property("ADBE Text Anchor Point 3D");
					} else if (forceCreate) {
						animator = layer.property("ADBE Text Properties").property("ADBE Text Animators").addProperty("ADBE Text Animator");
						animator.name = "anchor";
						return animator.property("ADBE Text Animator Properties").addProperty("ADBE Text Anchor Point 3D");
					}
				}
				break;
			case "size":
				if (layer instanceof ShapeLayer) {
					// TODO: Fa si pentru Elipse
					var vectorGroup = layer.property("ADBE Root Vectors Group").property("ADBE Vector Group");
					if (vectorGroup) {
						return vectorGroup.property("ADBE Vectors Group").property("ADBE Vector Shape - Rect").property("ADBE Vector Rect Size");
					} else if (forceCreate) {
						vectorGroup = layer.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
						return vectorGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect").property("ADBE Vector Rect Size");
					}
				}
				return undefined;// For TextLayer
				break;
			default:
				alert("getLayerProperty: property " + property + " is not recognised.\rPlease ask Codrin for details.");
		}
	}





	return {
		getProjectItemByName: getProjectItemByName,
		getProjectItemsWithParentFolder: getProjectItemsWithParentFolder,
		getLayerPositionAnchorSize: getLayerPositionAnchorSize
	}
})(this);