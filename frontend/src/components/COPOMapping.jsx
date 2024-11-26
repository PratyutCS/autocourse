import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Upload,
  Check,
  XCircle,
  Image as ImageIcon,
} from "lucide-react";
import "react-image-crop/dist/ReactCrop.css";
import { useRef } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";


function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const COPOMapping = ({ onSave, initialData }) => {
  const [tableMode, setTableMode] = useState("manual");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imgSrc, setImgSrc] = useState("");
  const imgRef = useRef(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const crop = centerAspectCrop(width, height, 16 / 9);
    setCrop(crop);
  };
  

  const fileInputRef = useRef(null);

  // Initialize state for CO descriptions
  const [courseOutcomes, setCourseOutcomes] = useState({
    CO1: { description: "", bullets: [] },
    CO2: { description: "", bullets: [] },
    CO3: { description: "", bullets: [] },
  });

  // Initialize mapping data with empty values
  const [mappingData, setMappingData] = useState({
    CO1: {
      PO1: "",
      PO2: "",
      PO3: "",
      PO4: "",
      PO5: "",
      PO6: "",
      PO7: "",
      PO8: "",
      PO9: "",
      PO10: "",
      PO11: "",
      PO12: "",
      PSO1: "",
      PSO2: "",
      PSO3: "",
      PSO4: "",
    },
    CO2: {
      PO1: "",
      PO2: "",
      PO3: "",
      PO4: "",
      PO5: "",
      PO6: "",
      PO7: "",
      PO8: "",
      PO9: "",
      PO10: "",
      PO11: "",
      PO12: "",
      PSO1: "",
      PSO2: "",
      PSO3: "",
      PSO4: "",
    },
    CO3: {
      PO1: "",
      PO2: "",
      PO3: "",
      PO4: "",
      PO5: "",
      PO6: "",
      PO7: "",
      PO8: "",
      PO9: "",
      PO10: "",
      PO11: "",
      PO12: "",
      PSO1: "",
      PSO2: "",
      PSO3: "",
      PSO4: "",
    },
  });

  // Effect to initialize with any provided data
  useEffect(() => {
    if (initialData) {
      if (initialData.tableMode) setTableMode(initialData.tableMode);
      if (initialData.uploadedImage)
        setUploadedImage(initialData.uploadedImage);
      if (initialData.courseOutcomes)
        setCourseOutcomes(initialData.courseOutcomes);
      if (initialData.mappingData) setMappingData(initialData.mappingData);
    }
  }, [initialData]);

  const handleImageUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImgSrc(reader.result.toString());
      setIsCropping(true);
    });
    reader.readAsDataURL(file);

    try {
      const response = await fetch("http://localhost:3000/upload-image", {
        method: "POST",
        headers: {
          "x-auth-token": localStorage.getItem("token"), // Ensure token is set
        },
        body: formData,
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Error from server:", errorResponse);
        throw new Error(errorResponse.message || "Error uploading the image");
      }

      const data = await response.json();
      setUploadedImage(file);
      setCroppedImageUrl(data.filePath); // Use filePath received from backend

      if (onSave) {
        onSave({
          tableMode,
          uploadedImage: file,
          mappingData: { imagePath: data.filePath }, // Save image path in JSON
        });
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      alert(error.message);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragActive(true);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };
  const cancelCrop = () => {
    setIsCropping(false);
    setImgSrc("");
    setUploadedImage(null);
    setCrop(undefined);
    setCompletedCrop(null);
  };
  const saveCrop = async () => {
    if (!completedCrop || !imgRef.current) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const image = imgRef.current;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    // Convert the canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) return;

      // Create a new file from the blob
      const croppedFile = new File([blob], "cropped-image.jpg", {
        type: "image/jpeg",
      });

      setUploadedImage(croppedFile);
      setCroppedImageUrl(URL.createObjectURL(croppedFile));
      setIsCropping(false);

      if (onSave) {
        onSave({
          tableMode,
          uploadedImage: croppedFile,
          courseOutcomes,
          mappingData,
        });
      }
    }, "image/jpeg");
  };

  const headers = [
    "CO/PO",
    "PO1",
    "PO2",
    "PO3",
    "PO4",
    "PO5",
    "PO6",
    "PO7",
    "PO8",
    "PO9",
    "PO10",
    "PO11",
    "PO12",
    "PSO1",
    "PSO2",
    "PSO3",
    "PSO4",
  ];

  const handleCellChange = (co, po, value) => {
    if (value === "" || /^[1-3]$/.test(value)) {
      const newMappingData = {
        ...mappingData,
        [co]: {
          ...mappingData[co],
          [po]: value,
        },
      };
      setMappingData(newMappingData);

      if (onSave) {
        onSave({
          courseOutcomes,
          mappingData: newMappingData,
        });
      }
    }
  };
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleOutcomeChange = (co, field, value) => {
    const newCourseOutcomes = {
      ...courseOutcomes,
      [co]: {
        ...courseOutcomes[co],
        [field]: value,
      },
    };
    setCourseOutcomes(newCourseOutcomes);

    if (onSave) {
      onSave({
        courseOutcomes: newCourseOutcomes,
        mappingData,
      });
    }
  };

  const addBullet = (co) => {
    const newCourseOutcomes = {
      ...courseOutcomes,
      [co]: {
        ...courseOutcomes[co],
        bullets: [...courseOutcomes[co].bullets, ""],
      },
    };
    setCourseOutcomes(newCourseOutcomes);

    if (onSave) {
      onSave({
        courseOutcomes: newCourseOutcomes,
        mappingData,
      });
    }
  };

  const removeBullet = (co, index) => {
    const newCourseOutcomes = {
      ...courseOutcomes,
      [co]: {
        ...courseOutcomes[co],
        bullets: courseOutcomes[co].bullets.filter((_, i) => i !== index),
      },
    };
    setCourseOutcomes(newCourseOutcomes);

    if (onSave) {
      onSave({
        courseOutcomes: newCourseOutcomes,
        mappingData,
      });
    }
  };

  const handleBulletChange = (co, index, value) => {
    const newCourseOutcomes = {
      ...courseOutcomes,
      [co]: {
        ...courseOutcomes[co],
        bullets: courseOutcomes[co].bullets.map((bullet, i) =>
          i === index ? value : bullet
        ),
      },
    };
    setCourseOutcomes(newCourseOutcomes);

    if (onSave) {
      onSave({
        courseOutcomes: newCourseOutcomes,
        mappingData,
      });
    }
  };

  const addRow = () => {
    const newCoNumber = Object.keys(mappingData).length + 1;
    const newCo = `CO${newCoNumber}`;

    const newPoMap = headers.slice(1).reduce((acc, po) => {
      acc[po] = "";
      return acc;
    }, {});

    const newMappingData = {
      ...mappingData,
      [newCo]: newPoMap,
    };

    const newCourseOutcomes = {
      ...courseOutcomes,
      [newCo]: { description: "", bullets: [] },
    };

    setMappingData(newMappingData);
    setCourseOutcomes(newCourseOutcomes);

    if (onSave) {
      onSave({
        courseOutcomes: newCourseOutcomes,
        mappingData: newMappingData,
      });
    }
  };

  const removeCourseOutcome = (coToRemove) => {
    // Create new objects without the removed CO
    const remainingOutcomes = Object.fromEntries(
      Object.entries(courseOutcomes).filter(([key]) => key !== coToRemove)
    );

    const remainingMappings = Object.fromEntries(
      Object.entries(mappingData).filter(([key]) => key !== coToRemove)
    );

    // Renumber the remaining COs
    const renumberedOutcomes = {};
    const renumberedMappings = {};

    Object.entries(remainingOutcomes).forEach(([_, value], index) => {
      const newKey = `CO${index + 1}`;
      renumberedOutcomes[newKey] = value;
    });

    Object.entries(remainingMappings).forEach(([_, value], index) => {
      const newKey = `CO${index + 1}`;
      renumberedMappings[newKey] = value;
    });

    setCourseOutcomes(renumberedOutcomes);
    setMappingData(renumberedMappings);

    if (onSave) {
      onSave({
        courseOutcomes: renumberedOutcomes,
        mappingData: renumberedMappings,
      });
    }
  };
  const [isDragActive, setIsDragActive] = useState(false);
  const handleTableModeChange = (selectedMode) => {
    setTableMode(selectedMode);
    if (selectedMode === "image" && croppedImageUrl) {
      // Save the image path in JSON
      if (onSave) {
        onSave({
          tableMode: selectedMode,
          mappingData: { imagePath: croppedImageUrl },
        });
      }
    } else if (onSave) {
      onSave({ tableMode: selectedMode });
    }
  };

  return (
    <div className="w-full">
      <div className="space-y-4 mb-8">
        {Object.entries(courseOutcomes).map(([co, outcome]) => (
          <div
            key={co}
            className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-gray-700 font-semibold min-w-[48px]">
                {co}:
              </span>
              <input
                type="text"
                value={outcome.description}
                onChange={(e) =>
                  handleOutcomeChange(co, "description", e.target.value)
                }
                className="flex-1 p-2.5 border border-gray-200 rounded bg-white hover:border-gray-300 transition-colors outline-none text-gray-700"
                placeholder="Enter course outcome description"
              />
              {Object.keys(courseOutcomes).length > 1 && (
                <button
                  onClick={() => removeCourseOutcome(co)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                  title="Remove course outcome"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            {outcome.bullets.map((bullet, index) => (
              <div key={index} className="ml-8 mb-2 flex items-center gap-2">
                <span className="text-gray-400">•</span>
                <input
                  type="text"
                  value={bullet}
                  onChange={(e) =>
                    handleBulletChange(co, index, e.target.value)
                  }
                  className="flex-1 p-2 border border-gray-200 rounded bg-white hover:border-gray-300 transition-colors outline-none text-gray-700"
                  placeholder="Enter bullet point"
                />
                <button
                  onClick={() => removeBullet(co, index)}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={() => addBullet(co)}
              className="ml-8 mt-2 flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 transition-colors"
            >
              <Plus size={16} />
              Add Bullet Point
            </button>
          </div>
        ))}
      </div>

      {/* Mapping Table Section - Switchable between Manual and Image */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            CO-PO Mapping Table
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTableModeChange("manual")}
              className={`px-4 py-2 rounded ${
                tableMode === "manual"
                  ? "bg-[#FFB255] text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Manual Input
            </button>
            <button
              onClick={() => handleTableModeChange("image")}
              className={`px-4 py-2 rounded ${
                tableMode === "image"
                  ? "bg-[#FFB255] text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Upload Image
            </button>
          </div>
        </div>

        {tableMode === "manual" ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table
              className="w-full border-collapse"
              style={{ minWidth: "800px" }}
            >
              <thead>
                <tr className="bg-gray-50">
                  {headers.map((header) => (
                    <th
                      key={header}
                      className="border-b border-r border-gray-200 p-3 text-sm font-semibold text-gray-600 w-12 first:w-20"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(mappingData).map(([co, poMap]) => (
                  <tr key={co} className="hover:bg-gray-50 transition-colors">
                    <td className="border-b border-r border-gray-200 font-semibold p-3 bg-gray-50 text-gray-700">
                      {co}
                    </td>
                    {headers.slice(1).map((po) => (
                      <td
                        key={`${co}-${po}`}
                        className="border-b border-r border-gray-200 p-2"
                      >
                        <input
                          type="text"
                          value={poMap[po]}
                          onChange={(e) =>
                            handleCellChange(co, po, e.target.value)
                          }
                          className="w-full h-8 text-center outline-none bg-transparent hover:bg-white transition-colors text-gray-700"
                          maxLength={1}
                          placeholder="-"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            className={`relative overflow-hidden rounded-xl border-2 border-dashed ${
              isDragActive
                ? "border-orange-400 bg-orange-50/50"
                : "border-gray-200 bg-white"
            } transition-all duration-200 hover:border-orange-200 hover:bg-orange-50/30`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isCropping ? (
              <div className="flex flex-col items-center gap-6 p-8">
                <div className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-lg border-2 border-orange-100">
                <ReactCrop
  crop={crop}
  onChange={(_, percentCrop) => setCrop(percentCrop)}
  onComplete={(c) => setCompletedCrop(c)}
  aspect={undefined}
>
  <img
    ref={imgRef}
    alt="Crop me"
    src={imgSrc}
    onLoad={onImageLoad}
    style={{ maxWidth: '100%' }}
  />
</ReactCrop>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={saveCrop}
                    className="px-6 py-2.5 bg-[#FFB255] text-white rounded-lg flex items-center gap-2 hover:bg-[#FF9617] transition-colors shadow-sm"
                  >
                    <Check size={18} /> Save Crop
                  </button>
                  <button
                    onClick={cancelCrop}
                    className="px-6 py-2.5 border border-gray-500 text-gray-500 rounded-lg flex items-center gap-2 hover:bg-gray-600 hover:text-white transition-colors shadow-sm"
                  >
                    <XCircle size={18} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12">
                <input
                  type="file"
                  id="table-image-upload"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                  ref={fileInputRef}
                  className="hidden"
                />
                {!uploadedImage ? (
                  <label
                    htmlFor="table-image-upload"
                    className="group cursor-pointer"
                  >
                    <div className="flex flex-col items-center gap-6">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-orange-100 opacity-20 transition-transform group-hover:scale-110" />
                        <div className="relative p-6 rounded-full bg-gradient-to-br from-orange-50 to-orange-100 shadow-sm">
                          <ImageIcon size={32} className="text-orange-500" />
                        </div>
                      </div>
                      <div className="space-y-2 text-center">
                        <p className="text-base font-medium text-gray-700">
                          Upload your CO-PO mapping table
                        </p>
                        <p className="text-sm text-gray-500">
                          Drag and drop or click to select
                        </p>
                        <p className="text-xs text-gray-400">
                          Supports PNG, JPG (up to 5MB)
                        </p>
                      </div>
                      <button
                        className="px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
                        onClick={handleSelectFile}
                      >
                        Select File
                      </button>
                    </div>
                  </label>
                ) : (
                  <div className="w-full space-y-6">
                    <div className="relative rounded-xl overflow-hidden shadow-lg">
                      <img
                        src={
                          croppedImageUrl || URL.createObjectURL(uploadedImage)
                        }
                        alt="CO-PO Mapping Table"
                        className="max-w-full h-auto"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                        <div className="absolute inset-0 flex items-center justify-center gap-4">
                          <label
                            htmlFor="table-image-upload"
                            className="px-4 py-2.5 bg-white/90 text-gray-800 rounded-lg cursor-pointer hover:bg-white transition-colors shadow-sm flex items-center gap-2"
                          >
                            <Upload size={18} />
                            Change Image
                          </label>
                          <button
                            onClick={() => {
                              setUploadedImage(null);
                              setCroppedImageUrl(null);
                              if (onSave) {
                                onSave({
                                  tableMode,
                                  uploadedImage: null,
                                  courseOutcomes,
                                  mappingData,
                                });
                              }
                            }}
                            className="px-4 py-2.5 bg-red-500/90 text-white rounded-lg hover:bg-red-500 transition-colors shadow-sm flex items-center gap-2"
                          >
                            <Trash2 size={18} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tableMode === "manual" && (
          <button
            onClick={addRow}
            className="mt-4 px-4 py-2 bg-[#FFB255] hover:bg-[#f5a543] text-white rounded-lg  transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus size={18} />
            Add Course Outcome
          </button>
        )}
      </div>
    </div>
  );
};

export default COPOMapping;
