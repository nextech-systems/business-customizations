# Copyright (c) 2024, Nexxttech Solutions Ja and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class HikvisionSettings(Document):
	def validate(self):
		"""Validate settings before saving"""
		if self.sync_method == "CSV" and not self.csv_file_path:
			frappe.throw("CSV file path is required when using CSV sync method")
		
		if self.sync_method == "Database":
			required_fields = ["database_type", "database_host", "database_name", "database_username"]
			for field in required_fields:
				if not getattr(self, field, None):
					frappe.throw(f"{field.replace('_', ' ').title()} is required for database sync")
	
	def on_update(self):
		"""Called after the document is saved"""
		if self.auto_sync and self.enabled:
			# Schedule automatic sync if enabled
			frappe.logger().info("Hikvision automatic sync is enabled")
