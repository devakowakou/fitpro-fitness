# FitPro Fitness - Homepage

A modern, responsive fitness website built with Next.js, Tailwind CSS, and TypeScript. This project showcases a fitness platform with sections for programs, pricing, testimonials, and more.

## Tech Stack

- **Framework:** Next.js 15
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Package Manager:** pnpm
- **UI Components:** Radix UI
- **Icons:** Lucide React
- **Animations:** Motion

## Features

- **Responsive Design:** Mobile-first approach with mobile navigation
- **Dark/Light Theme:** Toggle between themes
- **Fitness Programs:** Showcase of strength training, yoga, cardio, and nutrition
- **Pricing Plans:** Basic, Pro, and Elite tiers
- **Testimonials:** Customer reviews and ratings
- **Why Choose Us:** Highlight key benefits
- **Contact Integration:** Ready for contact forms

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- pnpm (install with `npm install -g pnpm`)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd fitpro-fitness
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint for code quality

## Project Structure

```
fitpro-fitness/
├── app/                 # Next.js app directory
│   └── page.tsx        # Main homepage
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── Navbar.tsx      # Main navigation
│   ├── Hero.tsx        # Hero section
│   ├── Programs.tsx    # Fitness programs
│   ├── Pricing.tsx     # Pricing plans
│   ├── Testimonials.tsx # Customer testimonials
│   └── ...
├── lib/                # Utilities and constants
│   ├── constants.ts    # App data (programs, testimonials, etc.)
│   └── utils.ts        # Helper functions
├── public/             # Static assets (images, icons)
└── package.json        # Dependencies and scripts
```

## Customization

- **Content:** Update `lib/constants.ts` to modify programs, testimonials, and pricing.
- **Styling:** Customize Tailwind classes in component files.
- **Images:** Add fitness-related images to `public/` directory.

## Deployment

The app can be deployed to Vercel, Netlify, or any platform supporting Next.js.

For Vercel:
```bash
pnpm build
```
Then deploy the `.next` folder.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
