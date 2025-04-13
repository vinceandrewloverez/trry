'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle, Clock, AlertCircle, Menu, X } from "lucide-react";
import curriculum from "@/data/curriculum";

type Course = {
  courseCode: string;
  courseTitle: string;
  units: number;
  preReqs?: string[];
  status: 'pending' | 'active' | 'passed';
};

type CourseData = Record<string, Course[]>;

export default function Home() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [editableData, setEditableData] = useState<CourseData>({});
  const [showScroll, setShowScroll] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const allCourses = Object.values(curriculum).flatMap(year =>
        Object.values(year).flat()
      );
      const total = allCourses.reduce((sum, c) => sum + (c.units || 0), 0);
      console.log("✅ Curriculum Total Units:", total);
    }

    const storedData = localStorage.getItem("courseStatus");

    const initialExpandedSections: Record<string, boolean> = {};
    const initialData: CourseData = {};

    Object.entries(curriculum).forEach(([year, terms]) => {
      Object.entries(terms).forEach(([term, courses]) => {
        const key = `${year} - ${term}`;
        initialData[key] = courses.map((course) => ({
          ...course,
          status: "pending",
        }));
        initialExpandedSections[key] = true;
      });
    });

    if (storedData) {
      setEditableData(JSON.parse(storedData));
    } else {
      setEditableData(initialData);
      localStorage.setItem("courseStatus", JSON.stringify(initialData));
    }

    setExpandedSections(initialExpandedSections);
  }, []);

  const updateStatus = (yearTerm: string, index: number, newStatus: 'pending' | 'active' | 'passed') => {
    setEditableData(prev => {
      const updated = { ...prev };
      updated[yearTerm][index].status = newStatus;
      localStorage.setItem("courseStatus", JSON.stringify(updated));
      return updated;
    });
  };

  const toggleSection = (yearTerm: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [yearTerm]: !prev[yearTerm],
    }));
  };

  const allCourses = Object.values(editableData).flat();
  const passedCourses = allCourses.filter(course => course.status === "passed").length;
  const progressPercent = allCourses.length > 0 ? Math.round((passedCourses / allCourses.length) * 100) : 0;
  const totalUnits = allCourses.reduce((sum, course) => sum + (course.units || 0), 0);
  const passedUnits = allCourses
    .filter(course => course.status === "passed")
    .reduce((sum, course) => sum + (course.units || 0), 0);

  return (
    <>
      {/* Navbar */}
      <nav className="dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-3xl p-4 mb-10">
        <div className="max-w-8xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-4xl font-extrabold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
            Strategix
          </Link>

          <button className="md:hidden text-gray-700 dark:text-gray-300" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          <div className="hidden md:flex space-x-6 text-xl">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300">Home</Link>
            <Link href="/coursetracker" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300">Course Tracker</Link>
            <Link href="/schedule-maker" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300">Schedule Maker</Link>
            <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300">About</Link>
          </div>
        </div>

        {isOpen && (
          <div className="mt-4 flex flex-col space-y-2 md:hidden text-lg">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300">Home</Link>
            <Link href="/coursetracker" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300">Course Tracker</Link>
            <Link href="/schedule-maker" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300">Schedule Maker</Link>
            <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300">About</Link>
          </div>
        )}
      </nav>

      {/* Main Section */}
      <div className="max-w-5xl mx-auto p-4 relative">
        <h1 className="text-4xl font-bold text-center mb-6 text-blue-600 dark:text-blue-300">📚 Course Tracker</h1>

        {/* Filter */}
        <div className="flex justify-center gap-4 mb-8">
          {["all", "passed", "active", "pending"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg border ${statusFilter === status ? "bg-blue-500 text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-center mb-2">Progress</h2>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden mb-2 relative">
            <div
              className="absolute top-0 left-0 h-full text-white text-sm font-medium text-center p-1 leading-none rounded-full transition-all duration-500 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"
              style={{ width: `${progressPercent}%` }}
            >
              {progressPercent}%
            </div>
          </div>
          <p className="text-center text-gray-700 dark:text-gray-300 text-sm">
            {passedUnits} / {totalUnits} units passed
          </p>
        </div>

        {/* Course Sections */}
        {Object.entries(editableData).map(([yearTerm, courses]) => {
          const isExpanded = expandedSections[yearTerm] ?? true;
          const areAllPassed = courses.every(course => course.status === 'passed');

          return (
            <div key={yearTerm} className="mb-6 rounded-xl border border-gray-300 dark:border-gray-700 overflow-hidden shadow-md">
              <div
                onClick={() => toggleSection(yearTerm)}
                className="w-full flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-lg font-semibold text-indigo-600 dark:text-indigo-300 cursor-pointer"
              >
                <span>{yearTerm.replace(/([A-Za-z]+)(\d+)/g, "$1 $2")}</span>
                <span className="transform transition-transform duration-300">
                  {isExpanded ? "-" : "+"}
                </span>
              </div>

              <div className={`transition-all duration-500 overflow-hidden bg-white dark:bg-gray-900 px-6 ${isExpanded ? "py-6" : "max-h-0"}`}>

                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => {
                      const newStatus = areAllPassed ? "pending" : "passed";
                      setEditableData(prev => {
                        const updated = { ...prev };
                        updated[yearTerm] = updated[yearTerm].map(course => ({ ...course, status: newStatus }));
                        localStorage.setItem("courseStatus", JSON.stringify(updated));
                        return updated;
                      });
                    }}
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  >
                    {areAllPassed ? 'Unmark All as Passed' : 'Mark All as Passed'}
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {courses
                    .filter(course => statusFilter === "all" || course.status === statusFilter)
                    .map((course, idx) => (
                      <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between mb-4">
                          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300">{course.courseTitle}</h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {typeof course.units === 'number' ? `${course.units} unit${course.units === 1 ? '' : 's'}` : 'N/A'}
                          </span>

                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {["pending", "active", "passed"].map((status) => (
                            <button
                              key={status}
                              onClick={() => updateStatus(yearTerm, idx, status as 'pending' | 'active' | 'passed')}
                              className={`px-4 py-2 rounded-lg border ${course.status === status
                                  ? status === "passed"
                                    ? "bg-green-500 text-white"
                                    : status === "active"
                                      ? "bg-yellow-500 text-white"
                                      : "bg-blue-500 text-white"
                                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                }`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scroll To Top */}
      {showScroll && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-10 right-10 p-3 bg-blue-600 text-white rounded-full shadow-lg"
        >
          ↑
        </button>
      )}
    </>
  );
}
