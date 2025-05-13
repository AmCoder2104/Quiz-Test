"use client"

import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"

export default function ResultsModal({ onClose }) {
  const router = useRouter()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-[#0537E7] p-6 text-center text-white">
          <div className="w-16 h-16 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Test Submitted!</h2>
          <p className="opacity-90">Thank you for completing the test.</p>
        </div>

        <div className="p-6 text-center">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Good luck!</h3>
            <p className="text-gray-600">
              Your test has been submitted successfully. The results will be reviewed by our team.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-[#0537E7] rounded-lg font-medium text-white hover:bg-[#042EB5]"
          >
            Return Home
          </button>
        </div>
      </div>
    </div>
  )
}
