"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NavComponent from "@/components/NavComponent";

const NoisePage = () => {
  return (
    <div className="container mx-auto p-4">
      <NavComponent />
      <h1 className="text-3xl font-bold mb-4 mt-20 text-center">
        {" "}
        <span className="text-primary mr-2">Noise Quality</span>
        <span>Parameters</span>
      </h1>
      <p className="mb-8">
        This page explains the various parameters collected for noise pollution
        monitoring. Understanding these parameters is key to interpreting the
        data correctly.
      </p>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>LAeq - Equivalent Continuous Sound Level</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> dB(A)
            </p>
            <p>
              LAeq is the cornerstone of environmental noise assessment. It
              represents the average sound energy over a specified period,
              effectively converting a fluctuating noise level into a steady,
              continuous one. For example, if you have a noise level that is 60
              dB for half the time and 40 dB for the other half, the LAeq would
              be a value that represents the total sound energy. It is crucial
              for assessing long-term noise exposure and compliance with
              regulatory standards.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              LAFMax - Maximum A-weighted, Fast-Response Sound Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> dB(A)
            </p>
            <p>
              LAFMax captures the peak noise level during a measurement period.
              The 'A-weighting' mimics the human ear's response to sound, and
              'Fast-Response' means the measurement instrument reacts quickly to
              changes in noise. This parameter is vital for identifying and
              quantifying short, loud noise events, such as a car horn or a door
              slam, which can be particularly disruptive.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              LAFMin - Minimum A-weighted, Fast-Response Sound Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> dB(A)
            </p>
            <p>
              LAFMin is the lowest sound level recorded during the measurement
              period. It helps in understanding the noise floor or the quietest
              moments, providing a baseline against which other noise levels can
              be compared.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LA10 - Statistical Noise Level</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> dB(A)
            </p>
            <p>
              LA10 is the noise level that is exceeded for 10% of the
              measurement time. It is often used to describe traffic noise and
              is a good indicator of the louder, more intrusive noise events in
              a given environment. A higher LA10 value suggests more frequent or
              more intense peak noise events.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LA90 - Background Noise Level</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> dB(A)
            </p>
            <p>
              LA90 is the noise level exceeded for 90% of the measurement time.
              It is widely used to represent the background or ambient noise
              level of a location. This is the underlying noise that is present
              most of the time, and it is a crucial factor in assessing the
              overall acoustic character of an area.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> Hertz (Hz)
            </p>
            <p>
              Frequency, or pitch, is a fundamental property of sound.
              Low-frequency sounds (like the rumble of a truck) travel further
              and can be more disruptive than high-frequency sounds (like a
              bird's chirp). Analyzing the frequency content of noise is
              important for identifying its source and for designing effective
              noise control measures.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The duration over which the noise measurement was taken.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time of Day</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Categorizes when the measurement was taken (e.g., day, evening,
              night), as noise regulations can differ based on time.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location Type</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              The type of area where the measurement was taken (e.g.,
              industrial, residential, commercial, rural).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NoisePage;
