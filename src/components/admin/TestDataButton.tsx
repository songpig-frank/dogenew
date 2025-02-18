import React from "react";
import { Button } from "@/components/ui/button";
import { createTestData } from "@/lib/test-data";

const TestDataButton = () => {
  const [loading, setLoading] = React.useState(false);

  const handleCreateTestData = async () => {
    console.log("TestDataButton: handleCreateTestData clicked");
    try {
      setLoading(true);
      const result = await createTestData();
      if (result.success) {
        alert("Test data created successfully!");
      } else {
        alert("Error creating test data: " + JSON.stringify(result.error));
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Error creating test data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleCreateTestData} disabled={loading}>
      {loading ? "Creating..." : "Create Test Data"}
    </Button>
  );
};

export default TestDataButton;
