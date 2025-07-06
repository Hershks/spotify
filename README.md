In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### Troubleshooting

If you encounter an error on startup, it likely means the Bearer token has expired. You'll need to generate a new one from Spotify:

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Select your app
3. Navigate to the "Settings" tab
4. Generate a new Bearer token
5. Update your environment variables or configuration with the new token
6. Restart the application


