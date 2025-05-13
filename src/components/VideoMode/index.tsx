import { motion } from "framer-motion";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';

const VideoMode = (props: {
    mode: () => void;
}) => {

    // absolut work in progress
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <p className="text-[2rem] text-purple-400 font-bold mb-4">🎬 Videokonverter</p>
            <p className="text-gray-400">Dieser Bereich ist aktuell noch in Arbeit.</p>

            <div className="py-5">
            <FontAwesomeIcon style={{width:'5rem', height:'5rem'}} className="animate-spin mt-6 w-full h-full" icon={faGear} />
            </div>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => props.mode()}
                className="mt-6 bg-purple-400 hover:cursor-pointer hover:bg-gray-600 text-white py-2 px-4 rounded-xl"
            >
                Zurück zur Auswahl
            </motion.button>
        </div>
    )
}
export default VideoMode;