import { AnimatePresence, motion } from "framer-motion";

export default function AlertSuccess({text, see, animate, change}) {
    return(
        <AnimatePresence>
            {see &&
                <motion.div
                animate={animate}
                exit={change}
                initial={change}
                className="alert alert-success mt-4" role="alert"
                >
                    {text}
                </motion.div>
            }
        </AnimatePresence>
    )
}