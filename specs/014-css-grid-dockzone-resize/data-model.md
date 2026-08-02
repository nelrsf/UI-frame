# Data Model: CSS Grid Dockzone Resize

## Entities

### Resizable Zone

**Description**: Represents a customizable area within a panel or workspace that can be resized by the user

**Fields**:
- `id`: string - Unique identifier for the zone
- `zoneType`: string - Type of zone (e.g., 'bottom-panel', 'primary-workspace')
- `dimensions`: object - Current dimensions of the zone
  - `width`: number - Current width in pixels
  - `height`: number - Current height in pixels
- `minDimensions`: object - Minimum dimensions for the zone
  - `width`: number - Minimum width (100px)
  - `height`: number - Minimum height (100px)
- `gridProperties`: object - CSS grid properties for the zone
  - `gridColumn`: string - CSS grid column property
  - `gridRow`: string - CSS grid row property

**Validation Rules**:
- Width and height must be >= 100px
- Zone must have a unique identifier
- Zone type must be a valid panel type

**State Transitions**:
- Initial: Zone created with default dimensions
- Resizing: Zone dimensions updated based on user interaction
- Validation: Zone dimensions checked against minimum constraints

### Splitter Handle

**Description**: The UI element that users interact with to resize adjacent zones

**Fields**:
- `id`: string - Unique identifier for the splitter handle
- `orientation`: string - Orientation of the splitter ('vertical' or 'horizontal')
- `zoneId1`: string - ID of the first zone adjacent to the splitter
- `zoneId2`: string - ID of the second zone adjacent to the splitter

**Validation Rules**:
- Orientation must be 'vertical' or 'horizontal'
- Both zoneId1 and zoneId2 must be valid zone identifiers

### Layout System

**Description**: The method used to adjust dimensions of zones during resize operations

**Fields**:
- `panelType`: string - Type of panel being managed ('bottom-panel', 'primary-workspace', 'secondary-panel')
- `zones`: array of Resizable Zone - List of zones in the panel
- `splitters`: array of Splitter Handle - List of splitters in the panel
- `gridContainerProperties`: object - CSS grid properties for the container

**Validation Rules**:
- Panel type must be a valid panel type
- Zones must be valid Resizable Zone entities
- Splitters must be valid Splitter Handle entities