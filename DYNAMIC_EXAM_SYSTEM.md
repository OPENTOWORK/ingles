# Dynamic Exam System

## Overview

This system has been redesigned to use a dynamic, data-driven approach for managing exams. Instead of having individual page files for each exam part, we now have:

1. **Centralized Data**: All exam questions and answers are stored in `/src/data/exams.js`
2. **Dynamic Components**: A single reusable component renders all exam types
3. **Dynamic Routes**: URL pattern `/niveles/[level]/[exam]/[part]` handles all exam parts

## Structure

### Data Format (`/src/data/exams.js`)
```javascript
const exams = {
  [level]: {
    [exam]: {
      [part]: {
        type: "question-type",
        title: "Part Title", 
        instructions: "Instructions for students",
        questions: [...], // or other question data
        // Additional type-specific fields
      }
    }
  }
}
```

### Supported Question Types

1. **multiple-choice-cloze**: Fill-in-the-blank with 4 options (A,B,C,D)
2. **open-cloze**: Fill-in-the-blank with text input
3. **word-formation**: Transform base words into correct forms
4. **key-word-transformation**: Rewrite sentences using key words
5. **reading-comprehension**: Reading passages with multiple choice questions
6. **gapped-text**: Choose paragraphs to fill gaps (A-G options)
7. **multiple-matching**: Match questions to text sections (A-D)

### Components

- **DynamicExamPage** (`/src/components/DynamicExamPage.js`): Main component that renders any exam part based on URL parameters
- **Dynamic Routes**: 
  - `/src/app/niveles/[level]/[exam]/page.js`: Exam overview page
  - `/src/app/niveles/[level]/[exam]/[part]/page.js`: Individual exam part

### Features

- **Automatic Progress Tracking**: Uses ExamContext to track answers
- **Immediate Feedback**: Shows correct/incorrect answers immediately
- **Timer Support**: Built-in countdown timer for timed sections
- **Responsive UI**: Adapts to different question formats
- **Navigation**: Automatic next/previous part navigation

## Adding New Exams

To add a new exam, simply add the data to `/src/data/exams.js` following the established format. No new page files needed!

Example:
```javascript
// Add to exams object
c1: {
  "exam-2": {
    "part-1": {
      type: "multiple-choice-cloze",
      title: "Reading and Use of English - Part 1",
      instructions: "For questions 1-8, read the text below...",
      questions: [
        { id: 1, text: "(1)", options: ["option1", "option2", "option3", "option4"], answer: "A" }
      ]
    }
  }
}
```

## Migration from Old System

The old individual part files (`/src/app/niveles/c1/exam-1/part-*/page.js`) can be removed once all data is migrated to the centralized JSON structure.

Current status: C1 Exam-1 Parts 1-7 have been migrated to the new system.