"use client"

import { Img } from "react-image"
import { Loader2 } from "lucide-react"
import minisanteLogo from './images/minisante_logo.png';
import rbcLogo from './images/rbc_logo.png';

export default function BulletinHeader() {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Logo Container */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        <div className="w-48 h-auto">
          <Img
            src={minisanteLogo}
            alt="Republic of Rwanda Ministry of Health"
            loader={
              <div className="flex justify-center items-center w-full h-32">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            }
            unloader={
              <div className="flex justify-center items-center w-full h-32 bg-gray-100 text-gray-400">
                Failed to load image
              </div>
            }
            className="w-full h-auto"
          />
        </div>
        <div className="w-48 h-auto">
          <Img
            src={rbcLogo}
            alt="Rwanda Biomedical Centre"
            loader={
              <div className="flex justify-center items-center w-full h-32">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            }
            unloader={
              <div className="flex justify-center items-center w-full h-32 bg-gray-100 text-gray-400">
                Failed to load image
              </div>
            }
            className="w-full h-auto"
          />
        </div>
      </div>

      {/* Title Section */}
      <div className="text-center space-y-2">
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <h1
            className="text-2xl md:text-4xl font-bold mb-2 tracking-wider"
            style={{
              textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            WEEKLY EPIDEMIOLOGICAL BULLETIN
          </h1>
          <div
            className="text-3xl md:text-5xl font-black tracking-wider"
            style={{
              textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            WEEK 28-2024
          </div>
          <div className="text-lg mt-2">(08-14 July 2024)</div>
        </div>
      </div>

      {/* Editorial Message */}
      <div className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-3 text-center">Editorial message</h2>
        <p className="text-sm md:text-base text-gray-700 mb-4">
          Effective and efficient disease surveillance system contribute to the reduction of morbidity, disability and
          mortality from disease outbreaks and health emergencies.
        </p>
        <p className="text-sm md:text-base text-gray-700">
          This weekly bulletin presents the epidemiological status of the priority diseases, conditions, and events
          under surveillance in Rwanda. These data are useful to trigger a rapid response for rapid impact, actions and
          results oriented, a proactive preparedness, risk mitigation and prevention, intelligence, real-time
          information, and communication for decision making.
        </p>
      </div>

      {/* Authors */}
      <div className="bg-gray-700 text-white p-4 text-center rounded">
        <p className="text-sm">
          <span className="font-semibold">Authors:</span> Public Health Surveillance & Emergency Preparedness and
          Response Division
        </p>
      </div>
    </div>
  )
}

