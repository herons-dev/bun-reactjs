## Bun ReactJS Template

This is a BunJS template for ReactJS applications with built-in ESLint and TypeScript support. It utilizes the Bun runtime for a performant and lightweight development experience.

### Features

* **Bun runtime:** Leverage the power of Bun, a high-performance JavaScript runtime, for your ReactJS applications.
* **ESLint:** Keep your code clean and consistent with ESLint integration.
* **TypeScript:** Enjoy type safety and enhanced development experience with TypeScript support.
* **Easy setup:** Get started quickly with the `bun create` command.

### Installation

1. **Install Bun:** Ensure you have Bun installed globally. Follow the instructions at [https://bun.sh/docs/installation](https://bun.sh/docs/installation).

2. **Create a ReactJS project:** Use the `bun create` command to generate a new project using this template:

```bash
bun create herons-dev/bun-reactjs my-react-app
```

### Running the Development Server

To start the development server and view your application, navigate to the project directory and run:

```bash
bun run dev
```

This will start a Bun server on `http://localhost:1290`. Open your browser and navigate to the URL to view your ReactJS application.

### Building the Project

To build your ReactJS application, navigate to the project directory and execute the following command:

```bash
bun run build
```

This command will generate an optimized production build of your application in the `build` folder within the project directory. The generated files are ready for deployment to a production server.

### TypeScript Configuration

This template is configured to use TypeScript for type checking and enhanced development experience. You can utilize TypeScript features like interfaces, classes, and generics to build robust and maintainable ReactJS applications.

### ESLint Integration

ESLint is integrated to enforce code style and consistency. The project comes with a pre-configured ESLint configuration file (`eslint.config.js`) that promotes clean and readable code.

### Customization

Feel free to customize the template to fit your specific project needs. Add additional components, pages, or modify the existing ones to create your desired ReactJS application.

### Contributing

We welcome contributions to this template. If you have any suggestions or improvements, please feel free to create an issue or submit a pull request.

### License

This template is licensed under the MIT License. For more information, refer to the LICENSE file in the repository.
