import { Composition } from 'remotion';
import { AlertZoneVideo } from './compositions/AlertZoneVideo';
import { LostChildVideo } from './compositions/LostChildVideo';
import { MedicalEmergencyVideo } from './compositions/MedicalEmergencyVideo';
import { VIDEO_CONFIG } from './helpers/constants';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AlertZoneVideo"
        component={AlertZoneVideo}
        durationInFrames={VIDEO_CONFIG.durationInFrames.alertZone}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
        defaultProps={{}}
      />
      <Composition
        id="LostChildVideo"
        component={LostChildVideo}
        durationInFrames={VIDEO_CONFIG.durationInFrames.lostChild}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
        defaultProps={{}}
      />
      <Composition
        id="MedicalEmergencyVideo"
        component={MedicalEmergencyVideo}
        durationInFrames={VIDEO_CONFIG.durationInFrames.medicalEmergency}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
        defaultProps={{}}
      />
    </>
  );
};

export default RemotionRoot;
