// Parameterized Tray - Rounded Box with Thickness
// Dimensions: Width x Breadth x Height with wall thickness and corner radius

// Parameters
width = 101+4;     // Outer width (mm)
breadth = 34+4;    // Outer breadth/depth (mm)
height = 10;     // Outer height (mm)
thickness = 2;  // Wall thickness (mm)
width2 = width - (2*thickness);
breadth2 = breadth - (2*thickness);
height2 = 10;    // Inner height (mm)

radius = 3;      // Corner radius (mm)
radius2 = 1;

width3 = 80;
breadth3 = 23;
height3 = 20;
radius3 = 1;

// Note: Ensure thickness < width/2, breadth/2, and radius < thickness/2 for valid geometry

// Main tray module
module tray() {
    difference() {
        // Outer shell
        rounded_box(width, breadth, height, radius);

        // Inner cavity (hollow out the tray)
        translate([thickness, thickness, thickness])
            rounded_box(width2, breadth2, height2, radius2);
    }
}

// Helper module for rounded box
module rounded_box(w, b, h, r) {
    hull() {
        // Bottom corners
        translate([r, r, 0]) cylinder(h = h, r = r);
        translate([w - r, r, 0]) cylinder(h = h, r = r);
        translate([r, b - r, 0]) cylinder(h = h, r = r);
        translate([w - r, b - r, 0]) cylinder(h = h, r = r);
    }
}

module cutout() {
    translate([13, 9, -5])
            rounded_box(width3, breadth3, height3, radius3);
}

module tray_with_cutout() {
    difference() {
        tray();

        cutout();
    }
}

// Render the tray with cutout
tray_with_cutout();
