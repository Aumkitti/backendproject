const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//major
exports.createMajor = async (req, res) => {
  try {
    const {
      major_code,
      majorNameTH,
      majorNameENG,
      majorYear,
      majorUnit,
      status,
    } = req.body;

    // Check if all required fields are provided
    if (
      !major_code ||
      !majorNameTH ||
      !majorNameENG ||
      !majorYear ||
      !majorUnit
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if the major_code already exists
    const existingMajor = await prisma.major.findFirst({
      where: { major_code: major_code },
    });

    if (existingMajor) {
      return res
        .status(400)
        .json({ error: "Major with this code already exists" });
    }

    // Create new major without specifying major_id
    const newMajor = await prisma.major.create({
      data: {
        major_code,
        majorNameTH,
        majorNameENG,
        majorYear,
        majorUnit,
        status,
      },
    });

    res.status(201).json(newMajor);
  } catch (error) {
    console.error("Error creating major:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the major" });
  }
};

exports.getAllMajors = async (req, res) => {
  try {
    const majors = await prisma.major.findMany();
    res.status(200).json(majors);
  } catch (error) {
    console.error("Error fetching all majors:", error);
    res.status(500).json({ error: "An error occurred while fetching majors" });
  }
};

exports.getMajorByCode = async (req, res) => {
  try {
    const { major_code } = req.params;
    const major = await prisma.major.findFirst({
      where: { major_code: major_code },
    });

    if (!major) {
      return res.status(404).json({ error: "Major not found" });
    }

    res.status(200).json(major);
  } catch (error) {
    console.error("Error fetching major by code:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the major" });
  }
};

exports.updateMajor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      major_code,
      majorNameTH,
      majorNameENG,
      majorYear,
      majorUnit,
      status,
    } = req.body;

    if (isNaN(parseInt(id, 10))) {
      return res.status(400).json({ error: "Invalid major_id format" });
    }

    const updatedMajor = await prisma.major.update({
      where: { major_id: parseInt(id, 10) },
      data: {
        major_code,
        majorNameTH,
        majorNameENG,
        majorYear,
        majorUnit,
        status,
      },
    });

    res.status(200).json(updatedMajor);
  } catch (error) {
    console.error("Error updating major:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the major" });
  }
};

exports.deleteMajor = async (req, res) => {
  const { major_id } = req.params;

  try {
    // Check for major_id
    if (!major_id) {
      return res.status(400).json({ error: "Missing major_id" });
    }

    // Check if the Major exists
    const major = await prisma.major.findUnique({
      where: { major_id: parseInt(major_id, 10) },
    });

    if (!major) {
      return res.status(404).json({ error: "Major not found" });
    }

    // Delete related records in major_course
    await prisma.major_course.deleteMany({
      where: { major_id: parseInt(major_id, 10) },
    });

    // Delete related records in group_major
    const categories = await prisma.category.findMany({
      where: { major_id: parseInt(major_id, 10) },
      select: { category_id: true },
    });
    const categoryIds = categories.map((c) => c.category_id);

    await prisma.group_major.deleteMany({
      where: { category_id: { in: categoryIds } },
    });

    // Delete related records in category
    await prisma.category.deleteMany({
      where: { major_id: parseInt(major_id, 10) },
    });

    // Delete Major
    await prisma.major.delete({
      where: { major_id: parseInt(major_id, 10) },
    });

    // Respond with success message
    res.json({ message: "Major successfully deleted" });
  } catch (error) {
    console.error("Error deleting Major:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Category
exports.createCategory = async (req, res) => {
  try {
    const { category_name, category_unit, major_id } = req.body;

    // ตรวจสอบว่า major_id มีอยู่หรือไม่
    const majorExists = await prisma.major.findUnique({
      where: { major_id },
    });

    if (!majorExists) {
      return res
        .status(400)
        .json({ error: "Invalid major_id: No matching major found" });
    }

    const newCategory = await prisma.category.create({
      data: {
        category_name,
        category_unit,
        major_id,
      },
    });

    res.status(201).json(newCategory);
  } catch (error) {
    if (error.code === "P2002") {
      res.status(400).json({ error: "Category with this ID already exists" });
    } else {
      console.error("Error creating category:", error);
      res
        .status(500)
        .json({ error: "An error occurred while creating the category" });
    }
  }
};
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching all categories:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching categories" });
  }
};
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { category_id: parseInt(id) },
    });

    if (category) {
      res.status(200).json(category);
    } else {
      res.status(404).json({ error: "Category not found" });
    }
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the category" });
  }
};
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, category_unit, major_id } = req.body;

    const updatedCategory = await prisma.category.update({
      where: { category_id: parseInt(id) },
      data: {
        category_name,
        category_unit,
        major_id,
      },
    });

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the category" });
  }
};
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id);

    // Check if the Category exists
    const category = await prisma.category.findUnique({
      where: { category_id: categoryId },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Delete GroupMajor associated with the Category
    await prisma.group_major.deleteMany({
      where: { category_id: categoryId },
    });

    // Delete Courses associated with the Category
    await prisma.course.deleteMany({
      where: { category_id: categoryId },
    });

    // Delete the Category
    await prisma.category.delete({
      where: { category_id: categoryId },
    });

    res.json({ message: "Category successfully deleted" });
  } catch (error) {
    console.error("Error deleting Category:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the Category" });
  }
};

// Group Major
exports.createGroupMajor = async (req, res) => {
  try {
    const { group_name, group_unit, category_id } = req.body;

    const groupMajorExists = await prisma.category.findUnique({
      where: { category_id },
    });

    if (!groupMajorExists) {
      return res
        .status(400)
        .json({ error: "Invalid category_id: No matching major found" });
    }

    const newGroupMajor = await prisma.group_major.create({
      data: {
        group_name,
        group_unit,
        category_id,
      },
    });

    res.status(201).json(newGroupMajor);
  } catch (error) {
    if (error.code === "P2002") {
      res
        .status(400)
        .json({ error: "Group Major with this ID already exists" });
    } else {
      console.error("Error creating group major:", error);
      res
        .status(500)
        .json({ error: "An error occurred while creating the group major" });
    }
  }
};
exports.getAllGroupMajors = async (req, res) => {
  try {
    const groupMajors = await prisma.group_major.findMany();
    res.status(200).json(groupMajors);
  } catch (error) {
    console.error("Error fetching all group majors:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching group majors" });
  }
};
exports.getGroupMajorById = async (req, res) => {
  try {
    const { id } = req.params;

    const groupMajor = await prisma.group_major.findUnique({
      where: { group_id: parseInt(id) },
    });

    if (groupMajor) {
      res.status(200).json(groupMajor);
    } else {
      res.status(404).json({ error: "Group Major not found" });
    }
  } catch (error) {
    console.error("Error fetching group major by ID:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the group major" });
  }
};
exports.updateGroupMajor = async (req, res) => {
  try {
    const { id } = req.params;
    const { group_name, group_unit, category_id } = req.body;

    const updatedGroupMajor = await prisma.group_major.update({
      where: { group_id: parseInt(id) },
      data: {
        group_name,
        group_unit,
        category_id,
      },
    });

    res.status(200).json(updatedGroupMajor);
  } catch (error) {
    console.error("Error updating group major:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the group major" });
  }
};
exports.deleteGroupMajor = async (req, res) => {
  try {
    const { id } = req.params;
    const groupId = parseInt(id);

    // Check if the GroupMajor exists
    const groupMajor = await prisma.group_major.findUnique({
      where: { group_id: groupId },
    });

    if (!groupMajor) {
      return res.status(404).json({ error: "GroupMajor not found" });
    }

    // Delete Courses associated with the GroupMajor
    await prisma.course.deleteMany({
      where: { group_id: groupId },
    });

    // Delete the GroupMajor
    await prisma.group_major.delete({
      where: { group_id: groupId },
    });

    res.json({ message: "GroupMajor successfully deleted" });
  } catch (error) {
    console.error("Error deleting GroupMajor:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the GroupMajor" });
  }
};

// Course
exports.createCourse = async (req, res) => {
  try {
    const {
      course_id,
      courseNameTH,
      courseNameENG,
      courseUnit,
      courseTheory,
      coursePractice,
      categoryResearch,
      category_id,
      group_id,
    } = req.body;

    const newCourse = await prisma.course.create({
      data: {
        course_id,
        courseNameTH,
        courseNameENG,
        courseUnit,
        courseTheory,
        coursePractice,
        categoryResearch,
        category_id: category_id || null,
        group_id: group_id || null,
      },
    });

    res.status(201).json(newCourse);
  } catch (error) {
    console.error("Error creating course:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the course" });
  }
};
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany();
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching all courses:", error);
    res.status(500).json({ error: "An error occurred while fetching courses" });
  }
};
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { course_id: id }, // เนื่องจาก course_id เป็น String, ไม่ต้อง parseInt
    });

    if (course) {
      res.status(200).json(course);
    } else {
      res.status(404).json({ error: "Course not found" });
    }
  } catch (error) {
    console.error("Error fetching course by ID:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the course" });
  }
};
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      courseNameTH,
      courseNameENG,
      courseUnit,
      courseTheory,
      coursePractice,
      categoryResearch,
      category_id,
      group_id,
    } = req.body;

    const updatedCourse = await prisma.course.update({
      where: { course_id: id }, // เนื่องจาก course_id เป็น String, ไม่ต้อง parseInt
      data: {
        courseNameTH,
        courseNameENG,
        courseUnit,
        courseTheory,
        coursePractice,
        categoryResearch,
        category_id: category_id || null, // รับค่า null หรือ Int
        group_id: group_id || null, // รับค่า null หรือ Int
      },
    });

    res.status(200).json(updatedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the course" });
  }
};
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.course.delete({
      where: { course_id: id }, // เนื่องจาก course_id เป็น String, ไม่ต้อง parseInt
    });

    res.json({ message: "Course successfully deleted" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the course" });
  }
};

// Get courses by category_id
exports.getCoursesByCategoryId = async (req, res) => {
  try {
    const { category_id } = req.params;

    // ตรวจสอบว่ามี category_id หรือไม่
    if (!category_id) {
      return res.status(400).json({ error: "Category ID is required" });
    }

    // ค้นหาคอร์สทั้งหมดที่ตรงกับ category_id
    const courses = await prisma.course.findMany({
      where: { category_id: parseInt(category_id) },
    });

    // ส่งข้อมูลคอร์สที่ค้นพบ
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses by category ID:", error);
    res
      .status(500)
      .json({
        error: "An error occurred while fetching courses by category ID",
      });
  }
};
// Get categories by major_code
exports.getCategoriesByMajorCode = async (req, res) => {
  try {
    const { major_code } = req.params;

    // ตรวจสอบว่ามี major_code หรือไม่
    if (!major_code) {
      return res.status(400).json({ error: "Major Code is required" });
    }

    // ค้นหา major โดยใช้ major_code
    const major = await prisma.major.findFirst({
      where: { major_code: major_code },
    });

    if (!major) {
      return res.status(404).json({ error: "Major not found" });
    }

    // ค้นหาหมวดหมู่ทั้งหมดที่ตรงกับ major_id
    const categories = await prisma.category.findMany({
      where: { major_id: major.major_id },
    });

    // ส่งข้อมูลหมวดหมู่ที่ค้นพบ
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories by major code:", error);
    res
      .status(500)
      .json({
        error: "An error occurred while fetching categories by major code",
      });
  }
};
// Get groups by category_id
exports.getGroupsByCategoryId = async (req, res) => {
  try {
    const { category_id } = req.params;

    // ตรวจสอบว่ามี category_id หรือไม่
    if (!category_id) {
      return res.status(400).json({ error: "Category ID is required" });
    }

    // ค้นหากลุ่มหลักทั้งหมดที่ตรงกับ category_id
    const groups = await prisma.group_major.findMany({
      where: { category_id: parseInt(category_id) },
    });

    // ส่งข้อมูลกลุ่มหลักที่ค้นพบ
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching groups by category ID:", error);
    res
      .status(500)
      .json({
        error: "An error occurred while fetching groups by category ID",
      });
  }
};
// Get courses by group_id
exports.getCoursesByGroupId = async (req, res) => {
  try {
    const { group_id } = req.params;

    // ตรวจสอบว่ามี group_id หรือไม่
    if (!group_id) {
      return res.status(400).json({ error: "Group ID is required" });
    }

    // ค้นหาคอร์สทั้งหมดที่ตรงกับ group_id
    const courses = await prisma.course.findMany({
      where: { group_id: parseInt(group_id) },
    });

    // ส่งข้อมูลคอร์สที่ค้นพบ
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses by group ID:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching courses by group ID" });
  }
};
