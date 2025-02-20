 ## Release Notes for Data Analytics Lab 1.0.0
 ## Release Date: January 1, 2025

# Data Analytics Lab  

Data Analytics Lab is a powerful data visualization tool developed by **HISP Rwanda**. It offers an interactive dashboard experience, enabling users to create dynamic slides with highly customizable visualizations. The application integrates seamlessly with multiple DHIS2 instances and provides an intuitive interface for analyzing and presenting data effectively.  

---

## Features  

### 1. Data Source Management  

Data Analytics Lab allows secure and efficient integration with multiple DHIS2 instances.  

**Requirements**: To add a data source, the following details are required:  
- **Instance Name**  
- **Instance URL**  
- **Access Token**: Generated from the DHIS2 instance by the user, with an expiration date.   
- Expired tokens can be updated anytime with valid ones.  

ATTENTION: Whitelist Configuration:  
- Add the Data Analytics Lab URL to the DHIS2 instance whitelist to avoid CORS (Cross-Origin Resource Sharing) errors.  

Once added, Data Analytics Lab can securely fetch and analyze data from these data sources.  

---

### 2. Visualizer Management  

Create visually appealing and customizable data visualizations with the following features:  

- **Dimensions**: Configure visuals using three key dimensions:  
  1. **Data**  
  2. **Period**  
  3. **Organization Unit**  

- **Visualization Types**: Choose from 13 types, including:  
  - Table  
  - Column, Stacked Column  
  - Bar, Stacked Bar  
  - Line, Area  
  - Pie, Radar, Scatter  
  - Radial, Single Value, Tree Map  

- **Customization**: Modify visual attributes, such as:  
  - Color palette  
  - Axis font size  
  - Headings and subheadings  

- **Dynamic Data Source Switching**: Change data sources on the fly while designing visuals.  

---

### 3. Dashboard Management  

Combine multiple visuals to build fully customizable dashboards:  

- **Grid-Based Layout**:  
  - Drag, resize, and arrange visuals flexibly.  

- **Customization Options**:  
  1. Change dashboard background.  
  2. Pin dashboards to the home page for easy access.  
  3. Mark dashboards as favorites for quick retrieval.  

---

### 4. Presentation Mode  

Transform dashboards into dynamic slide presentations:  

- **Configuration Options**:  
  1. Define the number of slides to display at a time.  
  2. Set the duration for each slide.  
  3. Select available tracks for enhanced presentation effects.  

- **Interactivity**:  
  - **Pause and Resume Presentations**  
  - **Hover Over Visuals**: View details interactively.  
  - **Fullscreen Mode**: Offers a better viewing experience for presentations.  

---

## What's Next?  

Data Analytics Lab is evolving! Here are the planned features for future releases:  

1. **Calculated Indicators**: Integration for advanced analytics.  
2. **Dashboard Grouping**: Organize dashboards into folders or groups.  
3. **Filtering Capabilities**: Add filters similar to the official DHIS2 Data Visualizer app.  
4. **Dedicated Visual Settings**: Customize each visualization type uniquely.  
5. **Collaboration**: Enable multiple users to collaborate on visualizations.  
6. **Advanced Export**: Support exporting visuals in multiple formats.  
7. **Live Data Fetching**: Fetch data from non-DHIS2 systems for cross-platform analysis.  
8. **New Visualization Types**: Maps, Heatmaps, Gauge Charts, Combined Visualizations, and Time-Series Visuals.  

---

## Key Technologies  

Data Analytics Lab is built using the following technologies:  

- **React with TypeScript**: For building the user interface.  
- **Tailwind CSS**: For designing responsive and modern UI components.  
- **React Query**: For efficient data fetching and state management.  
- **DHIS2 App Runtime**: For seamless integration with DHIS2 APIs.  
- **Recharts & Mantine**: For dynamic and rich visualizations.  
- **React Hook Form**: For easy and validated form management.  

---

## Acknowledgments  

We extend our heartfelt gratitude to the following developers who contributed to this project:  

- **Roger Ndutiye**: [rogerndutiye@gmail.com]  
- **Nsengiyumva Christian**: [cristiannsengi@gmail.com] 
- **IRADUKUNDA Derrick**: [iradukundaderrick7@gmail.com] 
: 


---

## Getting Started  

To get started with Data Analytics Lab, run the following commands:  

 yarn install
 yarn build:css && yarn start

 ## Contact Us
For support or feedback, reach out to us at:
HISP Rwanda
Email: [mouricej@hisprwanda.org]
Website:[www.hisprwanda.org]