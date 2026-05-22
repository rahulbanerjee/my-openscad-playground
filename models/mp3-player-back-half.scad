// Parameterized Tray - Rounded Box with Thickness
// Dimensions: Width x Breadth x Height with wall thickness and corner radius

// Parameters
width = 167;     // Outer width (mm)
breadth = 74;    // Outer breadth/depth (mm)
height = 14;     // Outer height (mm)
thickness = 2;  // Wall thickness (mm)
width2 = width - (2*thickness);
breadth2 = breadth - (2*thickness);
height2 = 40;    // Inner height (mm)

radius = 5;      // Corner radius (mm)
radius2 = 5;

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

// Render the tray
tray();
