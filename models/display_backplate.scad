// Display Backplate for 7" Panel
// All dimensions in mm

// Parameters
plate_thickness = 2; // Adjust for test prints (try 2-3mm)

// Main rectangle dimensions (convert inches to mm)
main_width = 6.5 * 25.4;  // 158.75mm
main_height = 4.2 * 25.4;  // 106.68mm

// Corner tab dimensions
tab_height = 9;           // mm (measured with calipers)
tab_width = (1/3) * 25.4; // 8.47mm (1/3 inch)
tab_radius = tab_width / 2; // 4.23mm

// Create the backplate
linear_extrude(height = plate_thickness)
    backplate_profile();

// 2D profile module
module backplate_profile() {
    union() {
        // Main rectangle
        translate([0, -main_height/2, 0])
            square([main_width, main_height]);

        // Top-left tab (NW) - extends up from left side
        translate([0, main_height/2, 0])
            tab_shape();

        // Top-right tab (NE) - extends up from right side
        translate([main_width, main_height/2, 0])
            mirror([1, 0, 0])
                tab_shape();

        // Bottom-left tab (SW) - extends down from left side
        translate([0, -main_height/2, 0])
            mirror([0, 1, 0])
                tab_shape();

        // Bottom-right tab (SE) - extends down from right side
        translate([main_width-tab_width, -main_height/2, 0])
            mirror([0, 1, 0])
                tab_shape();
    }
}

// Single tab shape - half-rounded rectangle, flat side at origin
module tab_shape() {
    // The flat side connects to main rectangle at y=0
    // The rounded end extends outward in positive y direction
    hull() {
        // Rectangle portion (half of tab_width, extending from flat side)
        square([tab_width, tab_height - tab_radius]);

        // Half-circle at the outer end
        translate([tab_radius, tab_height - tab_radius, 0])
            circle(r = tab_radius);
    }
}
