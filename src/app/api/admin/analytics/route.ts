import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

// GET /api/admin/analytics - Get placement analytics and statistics
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const branch = searchParams.get("branch");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const export_format = searchParams.get("export"); // csv or pdf

    // Build date filter for applications
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.appliedAt = { gte: new Date(startDate) };
    }
    if (endDate) {
      dateFilter.appliedAt = {
        ...dateFilter.appliedAt,
        lte: new Date(endDate),
      };
    }

    // 1. Overall Statistics
    const [
      totalStudents,
      totalDrives,
      totalApplications,
      offerApplications,
    ] = await Promise.all([
      prisma.student.count({
        ...(branch && { where: { branch } }),
      }),
      prisma.drive.count(),
      prisma.application.count({
        where: dateFilter,
      }),
      prisma.application.findMany({
        where: {
          status: "OFFER",
          ...dateFilter,
        },
        include: {
          student: {
            select: {
              id: true,
              branch: true,
            },
          },
          drive: {
            select: {
              ctc: true,
              company: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // 2. Calculate unique placed students
    const placedStudentIds = new Set(offerApplications.map((app) => app.student.id));
    const placedStudentsCount = placedStudentIds.size;

    // 3. Placement percentage
    const placementPercentage =
      totalStudents > 0 ? (placedStudentsCount / totalStudents) * 100 : 0;

    // 4. CTC Statistics
    const ctcValues = offerApplications
      .map((app) => app.drive.ctc)
      .filter((ctc): ctc is number => ctc !== null);

    const averageCTC =
      ctcValues.length > 0
        ? ctcValues.reduce((sum, ctc) => sum + ctc, 0) / ctcValues.length
        : 0;

    const highestCTC = ctcValues.length > 0 ? Math.max(...ctcValues) : 0;
    const lowestCTC = ctcValues.length > 0 ? Math.min(...ctcValues) : 0;

    // Median CTC
    const sortedCTC = [...ctcValues].sort((a, b) => a - b);
    const medianCTC =
      sortedCTC.length > 0
        ? sortedCTC.length % 2 === 0
          ? (sortedCTC[sortedCTC.length / 2 - 1] +
              sortedCTC[sortedCTC.length / 2]) /
            2
          : sortedCTC[Math.floor(sortedCTC.length / 2)]
        : 0;

    // 5. Branch-wise placement statistics
    const branches = await prisma.student.groupBy({
      by: ["branch"],
      _count: { id: true },
      ...(branch && { where: { branch } }),
    });

    const branchWiseStats = await Promise.all(
      branches.map(async (branchData) => {
        const branchStudents = branchData._count.id;
        const branchOffers = offerApplications.filter(
          (app) => app.student.branch === branchData.branch
        );
        const branchPlacedCount = new Set(
          branchOffers.map((app) => app.student.id)
        ).size;

        const branchCTCs = branchOffers
          .map((app) => app.drive.ctc)
          .filter((ctc): ctc is number => ctc !== null);

        const branchAvgCTC =
          branchCTCs.length > 0
            ? branchCTCs.reduce((sum, ctc) => sum + ctc, 0) / branchCTCs.length
            : 0;

        return {
          branch: branchData.branch,
          totalStudents: branchStudents,
          placedStudents: branchPlacedCount,
          placementPercentage:
            branchStudents > 0
              ? (branchPlacedCount / branchStudents) * 100
              : 0,
          averageCTC: branchAvgCTC,
          offersCount: branchOffers.length,
        };
      })
    );

    // 6. Top Recruiters (by offers count)
    const recruiterStats = offerApplications.reduce((acc, app) => {
      const companyName = app.drive.company.name;
      if (!acc[companyName]) {
        acc[companyName] = {
          companyName,
          offersCount: 0,
          totalCTC: 0,
          ctcValues: [] as number[],
        };
      }
      acc[companyName].offersCount++;
      if (app.drive.ctc) {
        acc[companyName].totalCTC += app.drive.ctc;
        acc[companyName].ctcValues.push(app.drive.ctc);
      }
      return acc;
    }, {} as Record<string, any>);

    const topRecruiters = Object.values(recruiterStats)
      .map((recruiter: any) => ({
        companyName: recruiter.companyName,
        offersCount: recruiter.offersCount,
        averageCTC:
          recruiter.ctcValues.length > 0
            ? recruiter.totalCTC / recruiter.ctcValues.length
            : 0,
        highestCTC:
          recruiter.ctcValues.length > 0
            ? Math.max(...recruiter.ctcValues)
            : 0,
      }))
      .sort((a, b) => b.offersCount - a.offersCount)
      .slice(0, 10);

    // 7. Status-wise distribution
    const statusDistribution = await prisma.application.groupBy({
      by: ["status"],
      _count: { id: true },
      where: dateFilter,
    });

    const statusStats = statusDistribution.map((stat) => ({
      status: stat.status,
      count: stat._count.id,
      percentage:
        totalApplications > 0
          ? (stat._count.id / totalApplications) * 100
          : 0,
    }));

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      userEmail: session.user.email || "",
      action: "CREATE",
      target: "Analytics",
      meta: {
        filters: { branch, startDate, endDate },
        export: export_format || null,
      },
      req,
    });

    const analyticsData = {
      overview: {
        totalStudents,
        placedStudents: placedStudentsCount,
        placementPercentage: parseFloat(placementPercentage.toFixed(2)),
        totalDrives,
        totalApplications,
        totalOffers: offerApplications.length,
      },
      ctcStatistics: {
        averageCTC: parseFloat(averageCTC.toFixed(2)),
        medianCTC: parseFloat(medianCTC.toFixed(2)),
        highestCTC,
        lowestCTC,
      },
      branchWise: branchWiseStats.map((stat) => ({
        ...stat,
        placementPercentage: parseFloat(stat.placementPercentage.toFixed(2)),
        averageCTC: parseFloat(stat.averageCTC.toFixed(2)),
      })),
      topRecruiters,
      statusDistribution: statusStats.map((stat) => ({
        ...stat,
        percentage: parseFloat(stat.percentage.toFixed(2)),
      })),
    };

    // Handle export formats
    if (export_format === "csv") {
      const csv = generateCSV(analyticsData);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="analytics-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to generate CSV
function generateCSV(data: any): string {
  const lines: string[] = [];

  // Overview section
  lines.push("OVERVIEW");
  lines.push("Metric,Value");
  lines.push(`Total Students,${data.overview.totalStudents}`);
  lines.push(`Placed Students,${data.overview.placedStudents}`);
  lines.push(`Placement Percentage,${data.overview.placementPercentage}%`);
  lines.push(`Total Drives,${data.overview.totalDrives}`);
  lines.push(`Total Applications,${data.overview.totalApplications}`);
  lines.push(`Total Offers,${data.overview.totalOffers}`);
  lines.push("");

  // CTC Statistics
  lines.push("CTC STATISTICS");
  lines.push("Metric,Value (LPA)");
  lines.push(`Average CTC,${data.ctcStatistics.averageCTC}`);
  lines.push(`Median CTC,${data.ctcStatistics.medianCTC}`);
  lines.push(`Highest CTC,${data.ctcStatistics.highestCTC}`);
  lines.push(`Lowest CTC,${data.ctcStatistics.lowestCTC}`);
  lines.push("");

  // Branch-wise statistics
  lines.push("BRANCH-WISE PLACEMENT");
  lines.push(
    "Branch,Total Students,Placed Students,Placement %,Average CTC,Total Offers"
  );
  data.branchWise.forEach((branch: any) => {
    lines.push(
      `${branch.branch},${branch.totalStudents},${branch.placedStudents},${branch.placementPercentage}%,${branch.averageCTC},${branch.offersCount}`
    );
  });
  lines.push("");

  // Top Recruiters
  lines.push("TOP RECRUITERS");
  lines.push("Company,Offers Count,Average CTC,Highest CTC");
  data.topRecruiters.forEach((recruiter: any) => {
    lines.push(
      `${recruiter.companyName},${recruiter.offersCount},${recruiter.averageCTC},${recruiter.highestCTC}`
    );
  });
  lines.push("");

  // Status Distribution
  lines.push("APPLICATION STATUS DISTRIBUTION");
  lines.push("Status,Count,Percentage");
  data.statusDistribution.forEach((stat: any) => {
    lines.push(`${stat.status},${stat.count},${stat.percentage}%`);
  });

  return lines.join("\n");
}
