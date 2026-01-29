# Content Import Scripts

This directory contains scripts to import your training documents into the platform.

## Setup

1. Install dependencies:
```bash
npm install mammoth docx-preview
```

2. Place your documents in organized folders:
```
documents/
├── modules/
│   ├── Module_1.docx
│   ├── Module_2.docx
│   └── ...
├── worksheets/
│   ├── Worksheet_1.docx
│   └── ...
├── case-studies/
│   └── Case_Study_Bank.docx
└── resources/
    └── Resource_Directory.docx
```

3. Set environment variables:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Usage

### Import Modules
```bash
npm run import:modules
```

### Import Worksheets
```bash
npm run import:worksheets
```

### Import Case Studies
```bash
npm run import:case-studies
```

### Import All
```bash
npm run import:all
```

## Scripts

- `import-modules.ts` - Import 9 module documents
- `import-worksheets.ts` - Import 6 learner worksheets
- `import-case-studies.ts` - Import case study bank
- `import-resources.ts` - Import resource directory
- `import-multimedia.ts` - Import multimedia resources
- `utils/parser.ts` - Document parsing utilities

## Notes

- Scripts parse DOCX files and convert to structured JSON
- Content is stored in database JSONB fields
- Images/files are uploaded to Supabase Storage
- Run migrations first: `supabase/migrations/`
