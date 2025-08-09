# Experience Fields Documentation

Based on Figma designs, this document itemizes all fields that make up experiences across different categories.

## Common Fields Across All Experience Types

### Details Tab
- **Duration** - Dropdown selector for experience duration (e.g., "1 week", "1 month", "2 months", "Current")
  - Help text: "This is the total time you worked on this project, including rehearsals"
- **Link** - Text field for project visual/portfolio link
- **Role** - Text field with chip selector for role in the project

### Team Tab
Common team member fields across all categories:
- **Main Talent** - Primary talent with chip selector
- **Choreographer(s)** - Multiple choreographers with chip selectors
- **Associate Choreographer(s)** - Multiple associate choreographers with chip selectors

Some categories include additional team roles:
- **Director** - Director of the project (Print/Commercial, Music Videos, Theater Production)

## TV/Film

### Details Tab
- **Project Type** - Dropdown selector ("Television & Film")
- **Title** - Text field for project title
- **Studio** - Dropdown selector for production studio (e.g., "Netflix")
- **Premier Date** - Optional date picker for premier date

### Team Tab
- Main Talent
- Choreographer(s)
- Associate Choreographer(s)

## Print/Commercial

### Details Tab
- **Company Name** - Text field for the company (e.g., "JBL")
- **Campaign Title** - Text field for campaign name
- **Production Company** - Text field for production agency
- **Premier Date** - Optional date picker for premier date

### Team Tab
- Director
- Main Talent
- Choreographer(s)
- Associate Choreographer(s)

## Music Videos

### Details Tab
- **Song Title** - Text field for song name
- **Song Artist(s)** - Text field with chip selector for artist(s)
- **Premier Date** - Optional date picker for premier date

### Team Tab
- Director
- Choreographer(s)
- Associate Choreographer(s)

## Live & Stage Performances

### Festival

#### Details Tab
- **Event Type** - Dropdown selector ("Festival")
- **Festival Title** - Text field for festival name (e.g., "Coachella")
- **Start Date** - Optional date picker for start date
- **End Date** - Optional date picker for end date

#### Team Tab
- Main Talent
- Choreographer(s)
- Associate Choreographer(s)

### Tour

#### Details Tab
- **Event Type** - Dropdown selector ("Tour")
- **Tour Name** - Text field for tour title
- **Tour Artist** - Text field for artist name
- **Event Type** - Additional dropdown (appears to be duplicate field for sub-type)
- **Start Date** - Optional date picker for start date
- **End Date** - Optional date picker for end date

#### Team Tab
- Main Talent
- Choreographer(s)
- Associate Choreographer(s)

### Concerts

#### Details Tab
- **Event Type** - Dropdown selector ("Concerts")
- **Event Name** - Text field for concert/event name
- **Start Date** - Optional date picker for start date
- **End Date** - Optional date picker for end date

#### Team Tab
- Main Talent
- Choreographer(s)
- Associate Choreographer(s)

### Corporate

#### Details Tab
- **Event Type** - Dropdown selector ("Corporate")
- **Company Name** - Text field for company name
- **Event Name** - Text field for event title
- **Start Date** - Optional date picker for start date
- **End Date** - Optional date picker for end date

#### Team Tab
- Main Talent
- Choreographer(s)
- Associate Choreographer(s)

### Awards Show

#### Details Tab
- **Event Type** - Dropdown selector ("Award Show")
- **Award Show Title** - Text field for awards show name (e.g., "Video Music Awards")
- **Date** - Optional date picker for event date

#### Team Tab
- Main Talent
- Choreographer(s)
- Associate Choreographer(s)

### Theater Production

#### Details Tab
- **Event Type** - Dropdown selector ("Theater Production")
- **Production Title** - Text field for production name
- **Theater** - Text field for theater venue
- **Start Date** - Optional date picker for start date
- **End Date** - Optional date picker for end date

#### Team Tab
- Director (with description: "Theater director for the production")
- Choreographer(s)
- Associate Choreographer(s)

### Other

#### Details Tab
- **Event Type** - Dropdown selector ("Other")
- **Event Name** - Text field for custom event name
- **Start Date** - Optional date picker for start date
- **End Date** - Optional date picker for end date

#### Team Tab
- Main Talent
- Choreographer(s)
- Associate Choreographer(s)

## UI Components Used

- **Dropdown Selectors** - For predefined options (event types, studios, durations)
- **Text Input Fields** - For free-form text entry
- **Date Pickers** - For date selection
- **Chip Selectors** - For selecting and displaying multiple values (roles, talent names)
- **Save Button** - Primary action button for saving experience
- **Delete Button** - Secondary action for removing experience

## Date Fields Summary

- **TV/Film, Music Videos, Print/Commercial**: Single "Premier Date" field (optional)
- **Festival, Tour, Concerts, Corporate, Theater Production, Other**: "Start Date" and "End Date" fields (optional)
- **Awards Show**: Single "Date" field (optional)

## Notes

- All experience types have a two-tab structure: "Details" and "Team"
- Duration field is universal across all types with help text: "This is the total time you worked on this project, including rehearsals"
- All date fields are optional
- Fields marked with placeholder text "Start typing to add..." indicate optional or multiple-entry fields
- Chip selectors allow for multiple selections and display selected items as removable chips
- The "Role" field appears consistently with example chips like "Principal Dancer" or "Dancer"
- All forms include Save and Delete actions at the bottom