import { AnimatePresence, motion } from "framer-motion";

export default function AlertDanger({text, see, animate, change}) {
    return(
        <AnimatePresence>
            {see &&
                <motion.div
                animate={animate}
                exit={change}
                initial={change}
                className="alert alert-danger mt-4" role="alert"
                >
                    {text}
                </motion.div>
            }
        </AnimatePresence>
    )
}