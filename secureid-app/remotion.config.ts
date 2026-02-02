import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setCodec('h264');

// Output directory for rendered videos
Config.setOutputLocation('public/videos/how-it-works');
